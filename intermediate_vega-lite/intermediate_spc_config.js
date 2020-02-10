/* Dependencies:
    Use this string to add dependencies in /admin/visualizations

    https://cdn.jsdelivr.net/npm/vega@5.9.0,https://cdn.jsdelivr.net/npm/vega-lite@4.0.0,https://cdn.jsdelivr.net/npm/vega-embed@6.2.1
*/


const getVegaLiteDefinition = function(lookerData, element) {
  vegaLiteDefinition = {
    "$schema": "https://vega.github.io/schema/vega-lite/v4.json",
    "description": "Basic SPC Chart with parameterised fields for tutorial.",
    "data": { "values": lookerData.jsonData}, 
    "height": element.clientHeight * 0.9,
    "width": element.clientWidth * 0.9,

    "layer": [
      {
        "mark": {
          "type": "line", 
          "color": "lightgrey"
        },
        "encoding": {
          "x": {
            "field": lookerData.config.batch_number, 
            "type": "quantitative", 
            "title": "Day"
          },
          "y": {
            "field": lookerData.config.batch_value, 
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
            "field": lookerData.config.batch_number, 
            "type": "quantitative", 
            "title": "Day"
          },
          "y": {
            "field": lookerData.config.batch_value, 
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
            "field": lookerData.config.batch_value,
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
            "field": lookerData.config.lower_control_limit,
            "type": "quantitative",
            "title": "Transaction Value"
          },
          "y2": {
            "field": lookerData.config.upper_control_limit
          },
          "x": {
            "field": lookerData.config.batch_number,
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
            "field": lookerData.config.lower_spec_limit,
            "type": "quantitative",
            "title": "Transaction Value"
          },
          "y2": {
            "field": lookerData.config.upper_spec_limit
          },
          "x": {
            "field": lookerData.config.batch_number,
            "type": "quantitative"
          }
        }
      },
    ]
  }

  return vegaLiteDefinition
}


class SimpleLookerData {
  constructor(data, config) {
    this.data = data
    this.config = config
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

  classifyDataPoints() {
    this.jsonData.forEach(r => {
      if (r.trans_total_transaction_value >= r.mean) {
        r.point_class = 'plus'
      } else {
        r.point_class = 'minus'
      }
    })    
  }
}


const getOptions = function(queryResponse) {
  // set permanent options
  let options = {
    classifyDataPoints: {
      section: "Chart",
      type: "boolean",
      label: "Classify Data Points",
      default: false
    },
  }

  // build list of numeric fields for selection
  var fields = queryResponse.fields.dimension_like.filter(d => d.is_numeric)
  fields = fields.concat(queryResponse.fields.measure_like)    
  if (typeof queryResponse.fields.supermeasure_like !== 'undefined') {
    fields = fields.concat(queryResponse.fields.supermeasure_like)
  }

  var values = []
  for (var i = 0; i < fields.length; i++) {
    value = {}
    value[fields[i].label_short || fields[i].label] = fields[i].name.replace('.', '_')
    values.push(value)
  }

  options.batch_number = {
    section: "Input",
    type: "string",
    label: "Batch Number",
    display: "select",
    values: values,
    default: fields[0].name,
    order: 0,
  }

  options.batch_value = {
    section: "Input",
    type: "string",
    label: "Batch Value",
    display: "select",
    values: values,
    default: fields[1].name,
    order: 1,
  }

  options.upper_spec_limit = {
    section: "Input",
    type: "string",
    label: "Upper Specification Limit (USL)",
    display: "select",
    values: values,
    default: fields[2].name,
    order: 2,
  }

  options.lower_spec_limit = {
    section: "Input",
    type: "string",
    label: "Lower Specification Limit (LSL)",
    display: "select",
    values: values,
    default: fields[3].name,
    order: 3,
  }

  options.mean = {
    section: "Input",
    type: "string",
    label: "Mean",
    display: "select",
    values: values,
    default: fields[4].name,
    order: 4,
  }

  options.upper_control_limit = {
    section: "Input",
    type: "string",
    label: "Upper Control Limit (UCL)",
    display: "select",
    values: values,
    default: fields[5].name,
    order: 5,
  }

  options.lower_control_limit = {
    section: "Input",
    type: "string",
    label: "Lower Control Limit (LCL)",
    display: "select",
    values: values,
    default: fields[6].name,
    order: 6,
  }

  return options
}


const buildSPCChart = function(lookerData, element) {
  console.log('buildSPCChart() with LookerData:', lookerData)

  vegaLiteDefinition = getVegaLiteDefinition(lookerData, element)
  
  let vegaConfig = {
      "actions": false,
      "theme": "latimes",
  }
  
  console.log('vegaEmbed() with Vega Lite spec', vegaLiteDefinition)
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
    console.log('updateAsync() config', config)
    console.log('updateAsync() queryResponse', queryResponse)

    options = getOptions(queryResponse)
    this.trigger('registerOptions', options)

    lookerData = new SimpleLookerData(data, config)
    lookerData.buildJsonData()

    if (config.classifyDataPoints) {
      lookerData.classifyDataPoints()
    }

    buildSPCChart(lookerData, element)
    
    done();
  }
})