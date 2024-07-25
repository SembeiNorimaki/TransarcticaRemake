class Objective {
  constructor(data) {
    this.title = data.title;
    this.summary = data.summary;
    this.completed = data.completed;
    this.resources = data.resources;
  }

  checkCompleted() {
    for (let [resource, val] of Object.entries(this.resources)) {
      if (!val.completed) {
        return false;
      }
    }
    this.completed = true;
    console.log("Objective completed");
    return true;
  }
  updateResource(resourceName, resourceQty) {
    if (resourceName in this.resources) {
      this.resources[resourceName].delivered += resourceQty;
      if (this.resources[resourceName].delivered >= this.resources[resourceName].needed) {
        this.resources[resourceName].delivered = this.resources[resourceName].needed;
        this.resources[resourceName].completed = true;
        this.checkCompleted();
      }
    }
  }
}