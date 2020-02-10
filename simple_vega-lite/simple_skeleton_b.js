// https://cdn.jsdelivr.net/npm/vega@5.9.0,https://cdn.jsdelivr.net/npm/vega-lite@4.0.0,https://cdn.jsdelivr.net/npm/vega-embed@6.2.1
// https://vega.github.io/vega-lite/examples/layer_scatter_errorband_1D_stdev_global_mean.html

vegaLiteDefinition = {
  "$schema": "https://vega.github.io/schema/vega-lite/v4.json",
  "description": "A scatterplot showing horsepower and miles per gallons for various cars.",
  "data": {"url": "https://vega.github.io/vega-lite/examples/data/cars.json"},
  "layer": [
    {
      "mark": "point",
      "encoding": {
        "x": {"field": "Horsepower", "type": "quantitative"},
        "y": {"field": "Miles_per_Gallon", "type": "quantitative"}
      }
    },
    {
      "mark": {"type": "errorband", "extent": "stdev", "opacity": 0.2},
      "encoding": {
        "y": {
          "field": "Miles_per_Gallon",
          "type": "quantitative",
          "title": "Miles per Gallon"
        }
      }
    },
    {
      "mark": "rule",
      "encoding": {
        "y": {
          "field": "Miles_per_Gallon",
          "type": "quantitative",
          "aggregate": "mean"
        }
      }
    }
  ]
}


const buildSPCChart = function(element) {  
  let vegaConfig = {
      "actions": false,
      "theme": "latimes",
  }

  // HTML Container – Vis specification – Vega Configuration 
  vegaEmbed('#spcContainer', vegaLiteDefinition, vegaConfig).catch(console.warn)
}


looker.plugins.visualizations.add({
  create: function(element, config) {
    this.container = element.appendChild(document.createElement("div"));
    this.container.id = 'spcContainer';
  },

  updateAsync: function(data, element, config, queryResponse, details, done) {
    // Clear any errors from previous updates.
    this.clearErrors();
    console.log('updateAsync() data', data)

    // var container = document.getElementById('spcContainer')
    // container.textContent = JSON.stringify(data, null, 2)

    buildSPCChart(element)
    
    done();
  }
})