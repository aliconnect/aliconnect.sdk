require('@aliconnect/sdk').init().then(({config,Server,Control}) => {
  Control.on('change', (attr) => {
    // console.debug(attr);
    if (attr) {
      const message = JSON.stringify({message_type:'change',content:{attr},to:'05a62751-297f-4c8c-a6ea-c12b5e50785f'});
      Array.from(Server.clients)
      //.concat(client.webSocket)
      .filter(client => client.readyState === client.OPEN)
      .forEach(client => client.send(message));
    }
    // const data = JSON.stringify({attr});

    // Array.from(Server.clients)
    // .filter(client => client.readyState === client.OPEN)
    // .forEach(client => client.send(data));
  });
  Control.on('changeValue', attribute => {
    const acsmUrl = 'http://localhost/acsm/log.php?weblog';
    const {systemId,attributeType,value,name} = attribute;
    const body = {
      webLogItemArray: [{
        LocationID: 14, //LocationID per station C2=14
        SystemInstanceID: systemId, // REQUIRED //system_instance.id,
        StandardOutput: attributeType, // attr.name, // REQUIRED //String(attributeName).toLowerCase(),
        TextualValue: value, // REQUIRED //system_instance[attributeName] = sumattributes[attributeName],
        NumericValue: value, // "" //isNaN(value) ? "" : value,
        TimeStamp: new Date().toISOString(), // REQUIRED
        GroupID: 0, //system_instance.GroupID,
        TagID: 0,
        LogID: 0,
        LogType: "", //String((LogTypeArray[item.class] || "") + (attributeName || "")).toLowerCase(),
        Quality: "Valid",
      }],
    }
    return; // bij demo geen ACSM
    if (name == 'WATCHDOG_ACSM') {
      aim.fetch(acsmUrl).body(body).post()
      .then(body => aim.attrSet(attribute, 'state', 'connected'))
      .catch(err => aim.attrSet(attribute, 'state', 'error'))
    }
  })
});
