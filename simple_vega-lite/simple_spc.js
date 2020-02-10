/* Dependencies:
    Use this string to add dependencies in /admin/visualizations

    https://cdn.jsdelivr.net/npm/vega@5.9.0,https://cdn.jsdelivr.net/npm/vega-lite@4.0.0,https://cdn.jsdelivr.net/npm/vega-embed@6.2.1
*/

var vegaLiteDefinition = {
    "$schema": "https://vega.github.io/schema/vega-lite/v4.json",
    "description": "Basic SPC Chart with hard-coded fields for tutorial purposes.",
    "data": {},   // { "values": lookerData.jsonData} 
    "height": 0,  // elem.clientHeight * 0.9
    "width": 0,   // elem.clientWidth * 0.9

    "layer": [
      {
        "mark": {
          "type": "line", 
          "color": "lightgrey"
        },
        "encoding": {
          "x": {
            "field": "trans_transaction_day_of_month", 
            "type": "quantitative", 
            "title": "Day"
          },
          "y": {
            "field": "trans_total_transaction_value", 
            "type": "quantitative"
          },
        }
      },
      {
        "mark": {
          "type": "point",
          "size": 75,
          "color": "green",
          "filled": true,
        },
        "encoding": {
          "x": {
            "field": "trans_transaction_day_of_month", 
            "type": "quantitative", 
            "title": "Day"
          },
          "y": {
            "field": "trans_total_transaction_value", 
            "type": "quantitative"
          },
          "shape": {
            "value": "circle",
            "condition": [
              {"test": "datum['point_class'] == 'minus' ", "value": "circle"},
              {"test": "datum['point_class'] == 'plus' ", "value": "cross"}
            ]
          },
          "color": {
            "condition": [
              {"test": "datum['point_class'] == 'minus' ", "value": "red"},
              {"test": "datum['point_class'] == 'plus' ", "value": "blue"}
            ]
          }
        }
      },
      {
        "mark": {
            "type": "rule",
            "strokeDash": [12, 12]
        },
        "encoding": {
          "y": {
            "field": "trans_total_transaction_value",
            "type": "quantitative",
            "aggregate": "mean",
          },
          "color": {"value": "red"},
        }
      },
      {
        "mark": {
          "type": "errorband", 
          "color": "transparent",
          "opacity": 0.0,
          "borders": {
            "color": "grey",
            "opacity": 0.8,
            "strokeDash": [12, 12]
          }
        },
        "encoding": {
          "y": {
            "field": "mean_minus_3sd",
            "type": "quantitative",
            "title": "Transaction Value"
          },
          "y2": {
            "field": "mean_plus_3sd"
          },
          "x": {
            "field": "trans_transaction_day_of_month",
            "type": "quantitative"
          }
        }
      },
      {
        "mark": {
          "type": "errorband", 
          "color": "transparent",
          "opacity": 0.0,
          "borders": {
            "color": "orange",
            "opacity": 0.8,
            "strokeDash": [2, 2]
          }
        },
        "encoding": {
          "y": {
            "field": "mean_minus_2sd",
            "type": "quantitative",
            "title": "Transaction Value"
          },
          "y2": {
            "field": "mean_plus_2sd"
          },
          "x": {
            "field": "trans_transaction_day_of_month",
            "type": "quantitative"
          }
        }
      },
    ]
}


class SimpleLookerData {
  constructor(data) {
    this.data = data
    this.jsonData = []

    console.log('SimpleLookerData.data', this.data)
  }

  buildJsonData() {
    this.jsonData = []
    this.data.forEach(r => {
      let row = {}
      for( let [key, value] of Object.entries(r)) {
        let field = key.replace('.', '_')
        row[field] = r[key].value
      }
      this.jsonData.push(row)
    })
  }
}


const buildSPCChart = function(lookerData, elem) {
  console.log('buildSPCChart with data:', lookerData.jsonData)

  vegaLiteDefinition.data = { "values": lookerData.jsonData} 
  vegaLiteDefinition.height = elem.clientHeight * 0.9
  vegaLiteDefinition.width = elem.clientWidth * 0.9
  
  let vegaConfig = {
      "actions": false,
      "theme": "latimes",
  }
  
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

    lookerData = new SimpleLookerData(data)
    lookerData.buildJsonData()

    buildSPCChart(lookerData, element)
    
    done();
  }
})