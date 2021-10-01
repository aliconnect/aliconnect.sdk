(function(){
  function Calendar (data, containerElement) {
		$('link').attr('rel', 'stylesheet').attr('href', '/v1/src/css/calendar.css').parent(document.head);
		this.offsetWidth = 10;
		this.elem = containerElement;
		this.items = [];
		// //console.log(containerElement, data);
		this.elem.class('row calendar');
		this.show(containerElement, data);
	}
	Calendar.prototype = {
		app: [],
		dayofweek: ['Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag', 'Zondag'],
		maand: ['Januari', 'Februarie', 'Maart', 'April', 'Mei', 'Juni', 'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'],
		elcalender: null,
		eldag: null,
		curyear: null,
		curmonth: null,
		//init: function() {
		//    document.getElementById('nav').createElement('BUTTON', { className: "button calender" }).addEventListener("click", this.show);
		//    this.addapp(2014, 6, 6, { name: "overleg", StartDateTime: '2015-06-6 10:00:00' });
		//},
		dataDisciplines(data) {
			for (var i = 0, row; row = this.data[i]; i++) {
				////console.log(row.fields);
				var disiplines = { ME: '', HW: '', SW: '' };
				for (var n in disiplines) {
					if (row.StartDateTime && row.StartDateTime.Value) {// && row.fields[n].Value) {
						prow = { name: row.name + ' ' + n };
						prow.dend = new Date(row.StartDateTime.Value);
						prow.dend.setHours(16, 0, 0, 0);
						prow.dstart = new Date(prow.dend.getTime());
						prow.uren = row.attributes[n] ? row.attributes[n].Value : 0;
						//prow.wdgn = Math.ceil(prow.uren / (8 * row.fields.FTE.Value));
						for (var d = 1; d < prow.wdgn; d++) {
							prow.dstart = new Date(prow.dstart.getTime() - 24 * 60 * 60 * 1000);
							if (prow.dstart.getDay() == 0) prow.dstart = new Date(prow.dstart.getTime() - 24 * 60 * 60 * 1000);
							if (prow.dstart.getDay() == 6) prow.dstart = new Date(prow.dstart.getTime() - 24 * 60 * 60 * 1000);
						}
						prow.dstart.setHours(8, 0, 0, 0);
						//row.dgn = Math.floor(row.wdgn / 5) * 2 + row.wdgn;
						prow.left = (prow.dstart - dstart) / 60 / 60 / 1000;
						prow.width = (prow.dend - prow.dstart) / 60 / 60 / 1000;
						//console.log('PLANROW', prow.dend.toISOString(), 'WD', prow.wdgn, 'D', prow.dgn, prow.upd, prow.dstart.toISOString());
						if (prow.dend > maxdate) maxdate = prow.dend;
						this.items.push(prow);
					}
				}
			}
		},
		show(el, data) {
			//console.log('SHOW CAL');
			this.data = data || this.data;
			this.el = el || this.el;
			//if (!this.elcalender) {
			// dataDisciplines(data);
			this.elem.text('').append(
				this.elcalender = $('div').class("col agenda"),
				this.eldag = $('div').class("col aco").append(
					$('div').class('row top btnbar np').append(
						$('button').class('abtn previous'),
						$('button').class('abtn next'),
						$('button').class('abtn today r'),
						$('button').class('abtn workweek'),
						$('button').class('abtn week'),
						$('button').class('abtn month'),
						$('button').class('abtn close').on('click', e => this.el.parentElement.removeChild(this.el)),
					),
					//with (createElement('DIV', { className: "content col", id: "contentweek" })) {
					//createElement('DIV', { className: "weeks", id: "weeks" });
					//with (createElement('DIV', { className: 'weekview aco oa' })) {
					this.elweekheader = $('div').class('week row weekheader'),
					this.elweek = $('div').class('col aco oa'),
					//createElement('SPAN', { className: "seperator" });
				)
			);
			// this.addappdate({ name: "overleg", StartDateTime: '2017-01-30 10:00:00', EndDateTime: '2017-01-30 12:00:00' });
			// this.addappdate({ name: "overleg", StartDateTime: '2017-01-30 13:00:00', EndDateTime: '2017-01-30 14:00:00' });
			// this.addappdate({ name: "overleg", StartDateTime: '2017-01-30 13:45:00', EndDateTime: '2017-01-30 15:00:00' });
			// this.addappdate({ name: "overleg", StartDateTime: '2017-01-30 14:45:00', EndDateTime: '2017-01-30 16:00:00' });
			// this.addappdate({ name: "overleg", StartDateTime: '2017-01-31 11:00:00', EndDateTime: '2017-01-31 12:30:00' });
			// this.addappdate({ name: "overleg", StartDateTime: '2017-02-02 14:00:00', EndDateTime: '2017-02-02 16:00:00' });
			////console.log(this.app);
			this.vandaag = new Date();
			this.vandaag.setHours(0, 0, 0, 0);
			//gotodate(vandaag);
			this.gotomonth(this.vandaag);
			//}
			//screenfocus({ plan_on: false, cal_on: true });
		},
		addappdate: function(afspraak) {
			afspraak.sDt = new Date(afspraak.StartDateTime);
			afspraak.eDt = new Date(afspraak.EndDateTime);
			var jaar = afspraak.sDt.getFullYear();
			var maand = afspraak.sDt.getMonth();
			var dag = afspraak.sDt.getDate();
			if (!this.app[jaar]) this.app[jaar] = [];
			if (!this.app[jaar][maand]) this.app[jaar][maand] = [];
			if (!this.app[jaar][maand][dag]) this.app[jaar][maand][dag] = [];
			afspraak['duur'] = (afspraak.eDt - afspraak.sDt) / 60 / 1000;
			this.app[jaar][maand][dag].push(afspraak);
		},
		addapp: function(jaar, maand, dag, afspraak) {
			if (!this.app[jaar]) this.app[jaar] = [];
			if (!this.app[jaar][maand]) this.app[jaar][maand] = [];
			if (!this.app[jaar][maand][dag]) this.app[jaar][maand][dag] = [];
			afspraak['duur'] = 1;
			this.app[jaar][maand][dag].push(afspraak);
		},
		moveelement: function() {
			var deltaY = e.clientY - mouseY;
			var deltaX = e.clientX - mouseX;
			//    mouseY = e.clientY;     // Get the horizontal coordinate
			//console.log();
			if (action == 0) {
				//        dayWidth = document.getElementById("week").offsetWidth
				activeElement.style.top = Math.round((activeElementTop + deltaY) / 15) * 15 + 'px';
				//console.log(dayWidth);
				activeElement.style.left = Math.floor((activeElementLeft + deltaX) / dayWidth) * dayWidth + 'px';
			}
			else if (action == 1) {
				activeElement.style.height = Math.round((activeElementHeight + deltaY) / 15) * 15 + 'px';
			}
			else if (action == 2) {
				activeElement.style.top = Math.round((activeElementTop + deltaY) / 15) * 15 + 'px';
				activeElement.style.height = Math.round((activeElementHeight - deltaY) / 15) * 15 + 'px';
			}
		},
		agendacheckmouseup: function() {
			document.removeEventListener("mousemove", this.moveelement, true);
			document.removeEventListener("mouseup", this.agendacheckmouseup, true);
			//console.log(activeElement.parentElement.date.toDateTimeString());
			////console.log(activeElement.this.app.StartDateTime);
			var d = new Date(activeElement.parentElement.date);
			d.setHours(0);
			d.setSeconds(0);
			d.setMinutes(activeElement.offsetTop);
			if (!activeElement.app) activeElement.app = new Object;
			activeElement.app.StartDateTime = d.toDateTimeString();
			var eind = new Date(d);
			eind.setHours(0);
			eind.setSeconds(0);
			eind.setMinutes(activeElement.offsetTop + activeElement.offsetHeight);
			activeElement.app.eindDt = eind.toDateTimeString();
			//console.log(activeElement.app.StartDateTime);
			//console.log(activeElement.app.eindDt);
			//var xhr = new XMLHttpRequest();
			//xhr.open("POST", "../db/itempost.php?a=postitemfield&itemId=" + activeElement.app.itemId, true);
			//params = new FormData();
			//params.append('StartDateTime', activeElement.app.StartDateTime);
			//params.append('eindDt', activeElement.app.eindDt);
			//xhr.onload = function(e) {
			//    //console.log(this.responseText);
			//};
			//xhr.send(params);
			//return xhr;
			resizeelement = null;
			this.appcumcount();
		},
		appcumcount: function() {
			////console.log(this.app);
			if (this.app) for (var y in this.app) {
				for (var m in this.app[y]) {
					for (var d in this.app[y][m]) {
						for (var i = 0, a; a = this.app[y][m][d][i]; i++) {
							//console.log(y, m, d);
							if (a.el) {
								a.cnt = a.cnt || 1;
								a.l = a.l || 1;
								for (var j = i, a2; a2 = this.app[y][m][d][j]; j++) {
									if (a != a2) {
										////console.log(a2.sDt < a.eDt && a2.sDt > a.sDt, a2.eDt > a.sDt && a2.eDt < a.eDt, a, a2);
										if ((a2.sDt < a.eDt && a2.sDt > a.sDt) || (a2.eDt > a.sDt && a2.eDt < a.eDt)) {
											a.cnt += 1;
											a2.cnt = (a2.cnt || 1) + 1;
											a.l += 1;
											//console.log(a);
										}
									}
								}
								a.el.style.width = (100 / a.cnt) + '%';
								if (a.l > 1) a.el.style.left = (100 / a.l) + '%';
							}
						}
						////console.log(this.app[y][m][d]);
					}
				}
			}
		},
		divappointment: function(name) {
			this.el = document.createElement('DIV');
			with (this.el) {
				className = 'appointment';
				with (this.content = appendChild(document.createElement('DIV'))) {
					className = 'content';
					setAttribute("contenteditable", "true");
					innerText = name;
				}
				with (appendChild(document.createElement('DIV'))) {
					className = 'left';
					addEventListener("mousedown", function() {
						mouseY = e.clientY;     // Get the horizontal coordinate
						mouseX = e.clientX;     // Get the horizontal coordinate
						activeElement = this.parentElement;
						action = 0;
						activeElementTop = this.parentElement.offsetTop;
						activeElementLeft = this.parentElement.offsetLeft;
						activeElementHeight = this.parentElement.offsetHeight;
						document.addEventListener("mouseup", this.agendacheckmouseup, true);
						document.addEventListener("mousemove", this.moveelement, true);
					});
				}
				with (appendChild(document.createElement('DIV'))) {
					className = 'start';
					addEventListener("mousedown", function() {
						mouseY = e.clientY;     // Get the horizontal coordinate
						mouseX = e.clientX;     // Get the horizontal coordinate
						this.parentElement.style.width = '100%';
						activeElement = this.parentElement;
						action = 2;
						activeElementTop = this.parentElement.offsetTop;
						activeElementLeft = this.parentElement.offsetLeft;
						activeElementHeight = this.parentElement.offsetHeight;
						document.addEventListener("mouseup", this.agendacheckmouseup, true);
						document.addEventListener("mousemove", this.moveelement, true);
					});
				}
				with (appendChild(document.createElement('DIV'))) {
					className = 'eind';
					addEventListener("mousedown", function() {
						mouseY = e.clientY;     // Get the horizontal coordinate
						mouseX = e.clientX;     // Get the horizontal coordinate
						activeElement = this.parentElement;
						action = 1;
						activeElementHeight = this.parentElement.offsetHeight;
						document.addEventListener("mouseup", this.agendacheckmouseup, true);
						document.addEventListener("mousemove", this.moveelement, true);
					});
				}
			}
			return this.el;
		},
		newappointment: function(e) {
			//console.log('nieuw');
			if (this.innerText == '') {
				with (this.parentElement.parentElement.parentElement.appendChild(this.divappointment(''))) {
					//            value = '';
					style.top = this.offsetTop + 'px';
					this.content.focus();
					this.content.addEventListener("blur", function(e) { if (this.innerText == '') { this.parentElement.parentElement.removeChild(this.parentElement); } });
				}
			}
		},
		gotoweek: function(day) {
			//with (document.getElementById("contentweek")) {
			// this.buttons.title.innerText = startdate.getDate() + '-' + startdate.adddays(6).getDate() + ' ' + this.maand[startdate.getMonth()] + ' ' + startdate.getFullYear();
			var pd = new Date(startdate);
			this.elweekheader.text('').append(
				$('div').append(
					[0,1,2,3,4].map(d => {
						var dag = new Date(startdate);
						dag.setDate(startdate.getDate() + d);
						return $('div').text(dag.getDate() + ' ' + this.dayofweek[dag.getWeekday()]);
					})
				)
			);
			this.elweek.text('').append(
				$('div').class('row aco week weekbody').append(
					[0,1,2,3,4].map(d => {
						var divdate = $('div').class('days aco g');
						const date = new Date(pd);
						const dayWidth = this.elweek.elem.offsetWidth;
						for (var i = 0; i < 48; i++) {
							$('div').parent(divdate).text(d == 0 && i % 2 == 0 ? i / 2 : '').on('click', this.newappointment)
						}
						return divdate
					})
				)
			);
			scrollTop = Math.round((this.elweek.elem.scrollHeight - this.elweek.elem.clientHeight) / 2);
			this.appcumcount();
		},
		gotomonth: function(day) {
			////console.log('d '+day.toDateTimeString());
			firstdayofmonth = new Date(day.adddays(-day.getDate() + 1));
			////console.log('fdom '+firstdayofmonth.toDateString());
			firstdayofcalender = new Date(firstdayofmonth.adddays(-firstdayofmonth.getWeekday()));
			startdate = new Date(day.adddays(-day.getWeekday()));
			//document.getElementById("weeks").innerText = '';
			////console.log('startdate  ' + startdate.toDateTimeString());
			var pd = new Date(firstdayofcalender);
			this.elcalender.text('').append(
				$('div').class('row top').append(
					$('div').class('content').text(firstdayofmonth.getMonth()),
					$('button').class('abtn up').attr('date', firstdayofmonth).on('click', e => {
						var d = this.date.adddays(-1);
						////console.log(d.toDateString());
						Calendar.gotodate(d.adddays(-d.getDate() + 1));
					}),
					$('button').class('abtn down').attr('date', firstdayofmonth).on('click', e => {
						var d = this.date.adddays(+32);
						////console.log(d.toDateString());
						Calendar.gotodate(d.adddays(-d.getDate() + 1));
					}),
				),
				$('div').class('maand').append(
					[' ', 'M', 'D', 'W', 'D', 'V', 'Z', 'Z'].map(d => $('span').text(d)),
					['','','','',''].map((v,i) => $('div').append(
						$('span').text(pd.getWeek()),
						[0,1,2,3,4,5,6].map(
							d => $('button').class('abtn')
							.attr('date', this.date = new Date(pd), pd.setDate(pd.getDate() + 1))
							.text(pd.getDate())
							.attr("vandaag", pd.valueOf() == today.valueOf() ? '' : null)
							.attr("selected", pd.valueOf() >= startdate.valueOf() && pd.valueOf() <= startdate.adddays(4).valueOf() ? '' : null)
							.attr("othermonth", pd.getMonth() != firstdayofmonth.getMonth() ? '' : null)
							.attr("app", this.app[pd.getFullYear()] && this.app[pd.getFullYear()][pd.getMonth()] && this.app[pd.getFullYear()][pd.getMonth()][pd.getDate()] ? '' : null)
							.on('click', e => this.gotodate(this.date))
						)
					))
				),
			);
			this.gotoweek(day);
		},
		loadday: function(day) {
			var jaar = day.getFullYear();
			if (!this.app[jaar]) this.app[jaar] = [];
			var maand = day.getMonth();
			if (!this.app[jaar][maand]) this.app[jaar][maand] = [];
			var xhr = new XMLHttpRequest();
			var params = new FormData();
			params.append('start', '1-' + (maand + 1) + '-' + jaar);
			params.append('p', 'appointments');
			xhr.day = day;
			xhr.open('POST', '../db/details.php', true);
			xhr.onload = function(e) {
				////console.log(this.responseText);
				var data = JSON.parse(this.responseText);
				for (var i = 0, d; d = data[i]; i++) {
					var day = new Date(d.StartDateTime);
					////console.log(day.toString());
					addapp(day.getFullYear(), day.getMonth(), day.getDate(), d);
				}
				this.gotodate(this.day);
			}
			//xhr.send(params);
		},
		gotodate: function(day) {
			////console.log(day.toDateTimeString());
			////console.log(day.getMonth());
			if (typeof this.app[day.getFullYear()] == 'undefined' || typeof this.app[day.getFullYear()][day.getMonth()] == 'undefined') this.loadday(day);
			else if (day.getFullYear() != this.curyear || day.getMonth() != curmonth) this.gotomonth(day);
			else this.gotoweek(day);
		}
	};
}).call(this)
