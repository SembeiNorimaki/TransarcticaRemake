class MerchandiseWagon extends Wagon {
  constructor(id, name, wagonData, cargo) {
    super(id, name, wagonData);
    this.cargo = cargo;
  }
}