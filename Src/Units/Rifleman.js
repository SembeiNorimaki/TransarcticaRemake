class Rifleman extends Soldier {
  constructor(id, position, soldierType, owner) {
    super(id, position, soldierType, owner);
    
    let soldierTypeId = 0;
    if (this.owner == "cpu") {
      soldierTypeId = 1;
    }
    let spriteData = {
      "imgs": gameData.unitsData.soldier[soldierTypeId],
      "actions": ["idle", "walk", "shoot"],
      "nSprites": {"idle": 1, "walk": 6, "shoot": 2},
      "spriteDuration": {"idle": 100, "walk": 10, "shoot": 20}
    }

    this.sprite = new Sprite("idle", this.orientation, spriteData);
    this.attackRange = 150;
    this.viewRange = 200;
    this.hp = 100;

    this.fireSpeed = 10;
    this.fireCount = this.fireSpeed;
    this.walkSpeed = 1;
    

  }
}