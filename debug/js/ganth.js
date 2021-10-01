(function(){
  this.Ganth = function Ganth (data, ganthElement) {
		$('link').attr('rel', 'stylesheet').attr('href', '/v1/src/css/ganth.css').parent(document.head);
		this.el = this.ganthElement = ganthElement.class('row ganth').text('');
		this.startDateTime = dateTime0(new Date());
		this.endDateTime = dateTime0(this.startDateTime, 1);
		this.bars = [];
		dw = 24;
		//console.debug('GANTH START', data);
		if (typeof data === 'string') {
			return new AIM.HttpRequest(AIM.config.$, 'GET', data, e => {
				arguments.callee(e.body, el);
			});
		}
		this.rows = data || this.data;
		this.resetview(this.rows);
		this.rows.forEach(this.writerow, this);
		this.startDateTime = dateTime0(this.startDateTime, 1-this.startDateTime.getDay());
		this.endDateTime = dateTime0(this.endDateTime, 7+8-this.endDateTime.getDay());
		// //console.log(this.startDateTime, this.startDateTime.getDay());
		// while (this.startDateTime.getDay()) {
		//   this.startDateTime.setDate(this.startDateTime.getDate() - 1);
		// }
		// this.startDateTime.setDate(this.startDateTime.getDate() + 1);
		this.bars.forEach(bar => {
			bar.left = this.left(bar.sdt);
			bar.right = this.left(bar.edt);
			bar.css('left', bar.left + 'px');
			bar.css('width', (bar.right - bar.left + 24) + 'px');
		});
		const width = ((this.endDateTime.valueOf() - this.startDateTime.valueOf()) / 3600000) + 'px';
		elGanthTop.css('width', width);
		this.chartDiv.css('width', width);
		this.closeview();
	}
	Ganth.prototype = {
		left(dt) {
			return dt && this.startDateTime ? (dt.valueOf() - dateTime0(this.startDateTime).valueOf()) / 3600000 : 0;
		},
		goToday() {
			this.ganthElement.elem.parentElement.scrollLeft = this.left(new Date()) - 200;
		},
		closeview() {
			dDag = new Date(this.startDateTime);
			for (let dDag = new Date(this.startDateTime); dDag <= this.endDateTime; dDag.setDate(dDag.getDate() + 7)) {
				$('span').parent(elGanthTop2).text('w' + dDag.getWeek()).css('width', (7 * dw) + 'px');
				endDateTime = dDag;
			}
			for (let dDag = new Date(this.startDateTime); dDag < this.endDateTime; dDag.setDate(dDag.getDate() + 1)) {
				$('span').parent(elGanthTop3).class('d d' + dDag.getDay()).text(dDag.getDate()).css('width', dw + 'px')
			}
			for (let v, iDate = 0, dDag = new Date(this.startDateTime); dDag < endDateTime; dDag.setDate(dDag.getDate() + 1)) {
				if (v != dDag.getMonth() + 1) {
					var mdays = dDag.monthDays();
					if (!v) mdays -= this.startDateTime.getDate() - 1;
					$('span').parent(elGanthTop1).text(v = (1900 + dDag.getYear()) + '-' + (dDag.getMonth() + 1)).css('width',(mdays * dw) + 'px')
				}
				iDate += dDag.getDate() + mdays;
				dDag.setDate(dDag.getDate() + mdays);
				dDag.setDate(1);
			}
			this.startDateTime = new Date(this.startDateTime);
			//elGanth.style = 'width:' + ((endDateTime - startDateTime) / 60 / 60 / 1000) + 'px;top:60px;';
			var elToday = $('span').parent(this.chartElement).class('today').attr('time', new Date().toISOString()).css('left',this.left(new Date()) + 'px');
			this.goToday(elToday);
		},
		resetview(rows) {
			this.el.text('').append(
				$('div').class('row top abs np')
				// .operations({
				// 	today: { onclick: this.goToday },
				// 	close: { className: 'r', onclick: function() { this.el.parentElement.removeChild(this.el); }.bind(this) }
				// })
				,
				$('div').class('row folders').append(
					this.elList = $('ul').class('col aco ganthrows ganthlist oa').css('margin-top:60px;overflow:scroll;')
					.on('scroll', e => this.chartDiv.elem.scrollTop = e.target.scrollTop ),
				),
				this.divGantScroll = $('div').class('col aco')
				.css('overflow:scroll hidden;')
				.on('wheel', e => e.preventDefault(this.divGantScroll.elem.scrollLeft += e.deltaY))
				.append(
					elGanthTop = $('div').class('topfixed').append(
						elGanthTop1 = $('div').class('Ganthh'),
						elGanthTop2 = $('div').class('Ganthh'),
						elGanthTop3 = $('div').class('Ganthh ganthchart'),
					),
					this.chartDiv = $('div')
					.class('col aco')
					.css('overflow:hidden scroll;')
					.append(
						this.chartElement = $('ul')
						.class('col aco ganthrows ganthchart')
					)
				),
			);
			return;
			if (plandata.pln) {
				for (var d in plandata.pln) {
					d = AIM.Date.localdate(d);
					elGanth.createElement('SPAN', 'free', {
						style: Ganthstyle(d, AIM.Date.localdate(d.valueOf() + 3600000 * 24))
					});
				}
			}
		},
		writerow(row) {
			//console.log(row);
			// row.bars = row.bars || [];
			// if (!row.StartDateTime && !row.EndDateTime) return;
			// const startDateTime = dateTime0(row.EndDateTime, -1);//row.StartDateTime ? dateTime0(row.StartDateTime) : dateTime0(row.EndDateTime, -1);//row.StartDateTime ? row.StartDateTime : dateTime0(row.EndDateTime, -1);
			// let startDateTime = String(row.StartDateTime);
			// let endDateTime = String(row.EndDateTime);
			// if (startDateTime || endDateTime) {
			//   startDateTime = startDateTime ? dateTime0(startDateTime) : dateTime0(endDateTime);
			//   endDateTime = endDateTime ? dateTime0(endDateTime) : dateTime0(startDateTime);
			//   //console.log(row.title, startDateTime, endDateTime);
			// }
			// const bar = {
			//   sdt: String(row.StartDateTime),
			//   edt: String(row.EndDateTime),
			// };
			// //console.log(row.title,bar.sdt,bar.edt);
			const elGanth = this.elGanth = this.chartElement.append(
				$('li').class(row.state || '', row.hasChildren ? 'sum' : '').append(
					elRow = $('div').class('tr tot rgl').on('click', e => AIM.URL.set({ schema: row.schema, id: row.id })).append(
						elBar = $('div').class('bar').css([row.style || ''].join(' '))
						.attr('sdt', row.startDateTime)
						.attr('edt', row.endDateTime)
						.append(
							$('span').class('title').text(row.header0 || ''),
						),
					),
				)
			);
			this.bars.push(elBar);
			var text = [row.header0 || row.id, row.header1, row.header2].join(', ').replace("\r\n", '');//.replace(row.parent ? row.parent.Title : '', '');
			row.elList = this.elList.append(
				$('li')
				.class(row.className + ' ' + (row.state || ''))
				.assign('elGanth', elGanth)
				.attr('open', row.hasChildren ? '0' : null)
				.append(
					$('div').class('tr tot rgl').text(text)
					.attr('title', [row.title || row.id, row.subject, row.summary, row.hint].join("\r\n"))
					.css(row.style || '')
					.assign('parent', row)
					.assign('elGanth', elGanth)
					.attr('level', row.level = row.level || 1)
					// .on('click', AIM.toggleopen)
					// .on('click', () => AIM.request('/id/' + btoa(row['@id'])))
					.on('open', !row.hasChildren ? null : function(openstate) {
						////console.log(this, ganthElement);
						//var parent = this.parent;
						this.ganthElement.setAttribute('open', this.parentElement.getAttribute('open'));
						//parent.bargroup.el.scrollIntoView();
						//parent.ul = { elList: parent.elList.createElement('UL'), elGanth: parent.elGanth.createElement('UL') };
						//parent.children.forEach(function(row) { if (!row.elList) Ganth.writerow.call(parent.ul, row); });
					})
				)
			);
			let sdt = elBar.attr('sdt');
			let edt = elBar.attr('edt');
			if (!sdt && !edt) {
				return;
			} else if (sdt && !edt) {
				elBar.class('endless');
			} else if (!sdt && edt) {
				elBar.class('milestone');
			}
			elBar.sdt = sdt = sdt ? dateTime0(sdt) : dateTime0(edt);
			elBar.edt = edt = edt ? dateTime0(edt) : dateTime0(sdt);
			if (this.startDateTime.valueOf() >= sdt.valueOf()) {
				this.startDateTime = sdt;
			}
			if (this.endDateTime.valueOf() <= edt.valueOf()) {
				this.endDateTime = dateTime0(edt, 1);
			}
			// row.bars.push({ StartDateTime: String(row.StartDateTime), EndDateTime: String(row.EndDateTime), title: row.title });
			//
			// with (elGanth.createElement('DIV', 'tr tot rgl', { onclick() { AIM.URL.set({ schema: row.schema, id: row.id }); }, })) {
			//   //row.bars = row.bars || [{ StartDateTime: row.StartDateTime, EndDateTime: row.EndDateTime, Title: row.Title, style: 'background:red;' }];
			//   //row.bars.push(row.bargroup = { className: 'bar group' });
			//   row.bars.forEach(bar => {
			//   });
			// }
			// if (startDateTime) {
			//
			// }
			// if (endDateTime && !startDateTime) {
			//   startDateTime = endDateTime
			// }
			// if (row.StartDateTime && row.EndDateTime) {
			// }
			////console.log('ROW', row);
			//if (row.parent) var nextSibling = row.parent.elList.nextElementSibling;
			var parent = row;
			//if (parent.id == '2752892-320') //console.log(parent.id, parent);
			if (parent.children && parent.children.length) {
				parent.ul = { elList: parent.elList.append($('ul')).assign('elGanth', parent.elList.elGanth.append($('ul'))) };
				parent.children.forEach(function(child) {
					child.parent = parent;
					writerow.call(parent.ul, child);
					parent.warning = parent.warning || child.warning;
					if (child.warning) { parent.elList.attr('warning', ''); }
				});
			}
		},
	};
}).call(this)
