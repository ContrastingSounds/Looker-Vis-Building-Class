looker.plugins.visualizations.add({
  create: function(element, config) {
    this.container = element.appendChild(document.createElement("div"));
    this.container.id = 'spcContainer';
  },

  updateAsync: function(data, element, config, queryResponse, details, done) {
    // Clear any errors from previous updates.
    this.clearErrors();
    console.log('updateAsync() data', data)

    var container = document.getElementById('spcContainer')
    container.textContent = JSON.stringify(data, null, 2)
    
    done();
  }
})
