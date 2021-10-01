Object.assign(Elem.prototype, {
  chart(data){
    (async () => {
      data = data.map(item => item.data).filter(item => item.data && item.key);
      let series = data.map(item => item.key).unique().map(key => Object({
        type: "ColumnSeries",
        dataFields: { valueX: key, categoryY: "category" },
        name: key,
        //fill: "#FAFAFA",
        strokeWidth: 1, stroke: '#FAFAFA',
        columns: { tooltipText: "[bold]{name}[/]\n[font-size:14px]{categoryY}: {valueX}" },
        bullets: [{ type: "LabelBullet", locationX: 0.5, label: { text: "{valueX}", fill: "black" } }],
        stacked: true,
      }));
      series.sort((a,b) => a.name.localeCompare(b.name));
      let cat = [].concat(...data.map(item => Object.keys(item.data))).unique();
      // cat =
      // console.log(cat);
      //
      //
      data = cat.map(
        category => Object.fromEntries(
          [['category', category]].concat(
            data.filter( item => item.data[category] ).map(
              item => [
                item.key,
                data.filter(
                  row => row.key === item.key && row.data[category]
                ).map(
                  item => Number(item.data[category])
                ).reduce(( a, b) => a + b)
              ]
            )
          )
        )
      );
      data.sort((a,b) => a.category.localeCompare(b.category));
      console.log(data);
      $.amcharts4core = $.amcharts4core = await this.script('/api/lib/amcharts4/core.js');
      $.amcharts4charts = $.amcharts4core = await this.script('/api/lib/amcharts4/charts.js');
      $.amcharts4animated = $.amcharts4animated = await this.script('/api/lib/amcharts4/animated.js');
      const config = {
        cursor: { type: "XYCursor", behavior: "zoomY" },
        legend: { type: "Legend", position: "right" },
        scrollbarX: { type: "XYChartScrollbar", scrollbarX: "scrollbarX" },
        yAxes: [{ type: "CategoryAxis", renderer: { minGridDistance: 20, grid: { location: 0 } }, dataFields: { category: "category" } }],
        xAxes: [{ type: "ValueAxis" }],
        data: data,
        series: series,
        // data: Object.entries(data).map(([key,value])=>Object.assign({category:key},value)),
        // series: $.Array.unique([].concat(...Object.values(data).map(value => Object.keys(value)))).sort().map(key => Object({
        // 	type: "ColumnSeries",
        // 	dataFields: { valueX: key, categoryY: "category" },
        // 	name: key,
        // 	//fill: "#FAFAFA",
        // 	strokeWidth: 1, stroke: '#FAFAFA',
        // 	columns: { tooltipText: "[bold]{name}[/]\n[font-size:14px]{categoryY}: {valueX}" },
        // 	bullets: [{ type: "LabelBullet", locationX: 0.5, label: { text: "{valueX}", fill: "black" } }],
        // 	stacked: true,
        // })),
      };
      var chart = am4core.createFromConfig(config, this.elem, "XYChart");
      [...this.elem.getElementsByTagName("g")].find(elem => elem.getAttribute('aria-labelledby') && elem.getAttribute('aria-labelledby').split('-').pop() === 'title').remove();
    })();
    return this;
  },
});
