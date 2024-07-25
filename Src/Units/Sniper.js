
class Sniper extends Soldier {
  constructor(id, position, soldierType, owner) {
    super(id, position, soldierType, owner);

    let spriteData = {
      "imgs": unitsData.soldier[1],
      "actions": ["idle", "walk", "shoot"],
      "nSprites": {"idle": 1, "walk": 6, "shoot": 2},
      "spriteDuration": {"idle": 100, "walk": 10, "shoot": 20}
    }

    this.sprite = new Sprite("idle", this.orientation, spriteData);
    this.range = 200;
    this.viewRange = 250;
    this.hp = 100;

    this.fireSpeed = 20;
    this.fireCount = this.fireSpeed;
    this.walkSpeed = 1;

    
  }
}