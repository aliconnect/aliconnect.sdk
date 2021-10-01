function Msa(config) {
  // console.log(window.msal);
  // if (!window.msal) return this;
  // msalClient = new msal.PublicClientApplication(config);
  // const authProvider = {
  // 	getAccessToken: async () => {
  // 		const token = await this.getToken();
  // 		// //console.log('token', token)
  // 		return token;//await this.getToken();
  // 	}
  // };
  // // //console.log('authProvider', {authProvider});
  // this.graphClient = MicrosoftGraph.Client.initWithMiddleware({authProvider});
  // this.user = JSON.parse($().storage('graphUser') || '{}');
  // // //console.log('graphUser', this.user);
}
Msa.prototype = {
  async getUser() {
    return await this.graphClient
    .api('/me')
    // Only get the fields used by the app
    .select('id,displayName,mail,userPrincipalName,mailboxSettings')
    .get();
  },
  async getContacts() {
    console.log('getContacts');
    $()
    .url('https://outlook.office.com/api/v2.0/me/contacts?top=1000')
    .headers({
      "Authorization": "Bearer "+$.user.data.mse_access_token.Value,
      "Accept": "application/json",							// Always accept JSON response.
    })
    // this.graphClient
    // .api('/me/contacts')
    // .top(100)
    .get()
    .then(e => {
      // e.body.value.forEach(row => row.schemaName = 'msaContact');
      let items = e.body.value.map(row => row.data);
      items.forEach(row => row.schema = 'msaContact');
      items = items.map(item => Item.get(item));
      // console.log(items);
      // console.log(items);
      $().list(items);
    })
    .catch(error => {
      //console.error(error, error);
    });
  },
  async getMessages() {
    const user = this.user;
    try {
      let response = await this.graphClient
      .api('/me/messages')
      .top(50)
      .select('subject,header3,isRead,isDraft,from,flag')
      .get();
      // response.value.forEach(row => {
      // 	//console.log(JSON.stringify(Object.fromEntries(Object.entries(row).map(entry => [entry[0],{}])),null,2).replace(/"(\w+)": /gs,'$1: '));
      // });
      response.value.forEach(row => row.schema = 'msaMessage');
      $().list(response.value)
    } catch (error) {
      //console.error(error, error);
    }
  },
  async getNotes() {
    const user = this.user;
    try {
      let response = await this.graphClient
      .api('/me/onenote/notebooks')
      .top(50)
      .get();
      response.value.forEach(row => {
        //console.log(JSON.stringify(Object.fromEntries(Object.entries(row).map(entry => [entry[0],{}])),null,2).replace(/"(\w+)": /gs,'$1: '));
      });
      response.value.forEach(row => row.schema = 'msaNotebook');
      $().list(response.value)
    } catch (error) {
      //console.error(error, error);
    }
  },
  async getEvents() {
    const user = this.user;
    // Convert user's Windows time zone ("Pacific Standard Time")
    // to IANA format ("America/Los_Angeles")
    // Moment needs IANA format
    let ianaTimeZone = getIanaFromWindows(user.mailboxSettings.timeZone);
    //console.log(`Converted: ${ianaTimeZone}`);
    // Configure a calendar view for the current week
    // Get midnight on the start of the current week in the user's timezone,
    // but in UTC. For example, for Pacific Standard Time, the time value would be
    // 07:00:00Z
    let startOfWeek = moment.tz('America/Los_Angeles').startOf('week').utc();
    // Set end of the view to 7 days after start of week
    let endOfWeek = moment(startOfWeek).add(7, 'day');
    try {
      // GET /me/calendarview?startDateTime=''&endDateTime=''
      // &$select=subject,organizer,start,end
      // &$orderby=start/dateTime
      // &$top=50
      let response = await this.graphClient
      .api('/me/calendarview')
      // Set the Prefer=outlook.timezone header so date/times are in
      // user's preferred time zone
      .header("Prefer", `outlook.timezone="${user.mailboxSettings.timeZone}"`)
      // Add the startDateTime and endDateTime query parameters
      .query({ startDateTime: startOfWeek.format(), endDateTime: endOfWeek.format() })
      // Select just the fields we are interested in
      .select('subject,organizer,start,end')
      // Sort the results by start, earliest first
      .orderby('start/dateTime')
      // Maximum 50 events in response
      .top(1)
      .get();
      // response.value.forEach(row => {
      // 	//console.log(JSON.stringify(Object.fromEntries(Object.entries(row).map(entry => [entry[0],{}])),null,2).replace(/"(\w+)": /gs,'$1: '));
      // });
      response.value.forEach(row => row.schema = 'msaEvent');
      $().list(response.value)
      // updatePage(Views.calendar, response.value);
    } catch (error) {
      //console.error(error, error);
      // updatePage(Views.error, {
      // 	message: 'Error getting events',
      // 	debug: error
      // });
    }
  },
  async createNewEvent() {
    const user = this.user;
    // Get the user's input
    const subject = document.getElementById('ev-subject').value;
    const attendees = document.getElementById('ev-attendees').value;
    const start = document.getElementById('ev-start').value;
    const end = document.getElementById('ev-end').value;
    const body = document.getElementById('ev-body').value;
    // Require at least subject, start, and end
    if (!subject || !start || !end) {
      updatePage(Views.error, {
        message: 'Please provide a subject, start, and end.'
      });
      return;
    }
    // Build the JSON payload of the e
    let newEvent = {
      subject: subject,
      start: {
        dateTime: start,
        timeZone: user.mailboxSettings.timeZone
      },
      end: {
        dateTime: end,
        timeZone: user.mailboxSettings.timeZone
      }
    };
    if (attendees)
    {
      const attendeeArray = attendees.split(';');
      newEvent.attendees = [];
      for (const attendee of attendeeArray) {
        if (attendee.length > 0) {
          newEvent.attendees.push({
            type: 'required',
            emailAddress: {
              address: attendee
            }
          });
        }
      }
    }
    if (body)
    {
      newEvent.body = {
        contentType: 'text',
        content: body
      };
    }
    try {
      // POST the JSON to the /me/events endpoint
      await this.graphClient
      .api('/me/events')
      .post(newEvent);
      // Return to the calendar view
      getEvents();
    } catch (error) {
      updatePage(Views.error, {
        message: 'Error creating e',
        debug: error
      });
    }
  },
  async signIn(msalRequest) {
    // Login
    try {
      // Use MSAL to login
      $().storage('msalRequest', JSON.stringify(msalRequest));
      const authResult = await msalClient.loginPopup(msalRequest);
      //console.log('id_token acquired at: ' + new Date().toString());
      // Save the account username, needed for token acquisition
      $().storage('msalAccount', this.username = authResult.account.username);
      // Get the user's profile from Graph
      this.user = await this.getUser();
      // return;
      $().storage('graphUser', JSON.stringify(this.user));
      // updatePage(Views.home);
    } catch (error) {
      //console.error(error);
      // updatePage(Views.error, {
      // 	message: 'Error logging in',
      // 	debug: error
      // });
    }
  },
  signOut() {
    this.account = null;
    $().storage('graphUser', null);
    msalClient.logout();
  },
  async getToken() {
    let account = $().storage('msalAccount');
    if (!account){
      throw new Error(
        'User account missing from session. Please sign out and sign in again.'
      );
    }
    try {
      const msalRequest = JSON.parse($().storage('msalRequest'));
      // First, attempt to get the token silently
      const silentRequest = {
        scopes: msalRequest.scopes,
        account: msalClient.getAccountByUsername(account)
      };
      // //console.log(account, silentRequest);
      const silentResult = await msalClient.acquireTokenSilent(silentRequest);
      return silentResult.accessToken;
    } catch (silentError) {
      // If silent requests fails with InteractionRequiredAuthError,
      // attempt to get the token interactively
      if (silentError instanceof msal.InteractionRequiredAuthError) {
        const interactiveResult = await msalClient.acquireTokenPopup(msalRequest);
        return interactiveResult.accessToken;
      } else {
        throw silentError;
      }
    }
  },
  api() {
    // const res = this.graphClient.api(...arguments)
    // //console.log('API', ...arguments);
    return this.graphClient.api(...arguments)
  }
};
