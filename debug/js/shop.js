const Shop = {
  setCustomer: function(e) {
    if (!$.config.$ || !$.config.$.auth || !$.config.$.auth.sub) {
      return;
    }
    $.shop.customer_id = this.tag || `Contact(${$.config.$.auth.sub})`;
    // //console.log('setCustomer', e);
    if (!$.getItem($.shop.customer_id) && !e) {
      new $.HttpRequest($.config.$, 'GET', '/' + $.shop.customer_id, arguments.callee).send();
      return;
    }
    if ($.shop.customer = $.getItem($.shop.customer_id)) {
      $.shop.customer.Title = $.shop.customer.Title || $.shop.customer.Name;
      // //console.log('setCustomer', $.shop.customer);
      // //console.log($.shop.customer);
      // $.om.navtop.shop.innerText = $.auth.name == $.shop.customer.Title ? '' : $.shop.customer.Title;
      $.shop.init();
    }
  },
  data: {},
  init: function() {
    // //console.log('SHOP INIT');
    // if ($.shop.customer.Product && $.shop.customer.Product.length) return;
    new $.HttpRequest($.config.$, 'GET', '/' + $.shop.customer_id + '/Product', {
      $select: 'files, filterfields, state, Title, Subject, Summary, CatalogPrice, SalesDiscount, Stock',
      $filter: 'IsPublic eq 1',
      $order: 'Title',
    }, e => {
      // //console.log('SHOP INIT DATA', e.body);
      if (!e.body) return;
      e.body.Product = e.body.Product || [];
      // $.om.navtop.shop.setAttribute('cnt', e.body.Product.length);
      //
      // return;
      // $.shop.data = this.data.bag;
      // $.shop.items = this.data.items;
      // if ($.shop.items) for (var i = 0, item; item = $.shop.$.getItem(i]; i++) {
      // 	if (!$.getItem(item.id]) $.getItem(item.id] = $.createItem(item);
      // 	$.getItem(item.id].refresh();
      // }
      // $.shop.refresh();
    }).send();
  },
  // onload: function(e) {
  // 	// //console.log(e.target.responseText);
  // 	return;
  // 	$.shop.data = this.data.bag;
  // 	$.shop.items = this.data.items;
  // 	if ($.shop.items) for (var i = 0, item; item = $.shop.$.getItem(i]; i++) {
  // 		if (!$.getItem(item.id]) $.getItem(item.id] = $.createItem(item);
  // 		$.getItem(item.id].refresh();
  // 	}
  // 	$.shop.refresh();
  // },
  order: function() {
    new $.HttpRequest($.config.$, 'POST', '/Shop/bag/order', {
      exec: '$.shopbag', a: !$.clientID ? 'purchaseorder' : 'createorder',
      //ClientID: $.clientID || $.client.account.id,
      userID: $.auth.sub, hostID: $.auth.aud
    }, e => {
      // //console.debug('ORDER FINISH', this.post, this.responseText);
      $.shop.init();
      $.show({ apnl: 'orderdone' });
    }).send();
  },
  add: function(item, amount) {
    // //console.debug(item, amount);
    new $.HttpRequest($.config.$, 'PATCH', '/' + $.shop.customer_id, {
      Product: {
        LinkID: item.ID,
        max: 999,
        Data: amount,
      },
      // exec: '$.shopbag',
      // a: 'add',
      // //ClientID: $.clientID || $.client.account.id,
      // userID: $.auth.sub,
      // accountID: $.client.account.id,
      // itemID: id,
      // quant: quant,
    }, e => {
      // //console.debug(e.target.responseText);
      // $.shop.init();
    }).send();
    // //console.debug($.shop.data);
    // for (var i = 0; i <= 1; i++) {
    // 	var elBag = $.getItem(id].elBagCnt[i];
    // 	if (elBag) elBag.Value = quant;
    // }
  },
};
