class Geometry {
  // Given a screen Position, returns the tilePosition as an Integer
  static screenToBoard(screenPos, cameraPos, tileHalfSize) {
    return createVector(
      round(
        (((screenPos.x + cameraPos.x - mainCanvasDim[0]/2) / tileHalfSize.x)  + 
        ((screenPos.y + cameraPos.y - mainCanvasDim[1]/2) / tileHalfSize.y) ) / 2
      ), 
      round(
        (((screenPos.y + cameraPos.y - mainCanvasDim[1]/2) / tileHalfSize.y)  - 
        ((screenPos.x + cameraPos.x - mainCanvasDim[0]/2) / tileHalfSize.x) ) / 2
      ) 
    );
  }

  // Given a tilePosition returns the screenPosition
  static boardToScreen(tilePos, cameraPos, tileHalfSize) {
    return createVector(
      (tilePos.x - tilePos.y) * tileHalfSize.x + mainCanvasDim[0] / 2 - cameraPos.x,
      (tilePos.x + tilePos.y) * tileHalfSize.y  + mainCanvasDim[1] / 2 - cameraPos.y
    );
  }

  static boardToCamera(tilePos, tileHalfSize) {
    return createVector(
      int((tilePos.x - tilePos.y) * tileHalfSize.x),
      int((tilePos.x + tilePos.y) * tileHalfSize.y)
    );
  }

  static cameraToBoard(screenPos, tileHalfSize) {
    return createVector(
      round((((screenPos.x) / tileHalfSize.x)  + ((screenPos.y ) / tileHalfSize.y) ) / 2) , 
      round((((screenPos.y) / tileHalfSize.y)  - ((screenPos.x ) / tileHalfSize.x) ) / 2) 
    );
  }

  // Given an angle [0...360) returns the closest 8-orientation 
  static angleToOri(angle) {
    let idx = floor((angle + 22.5) / 45);
    let ori = idx * 45;
    return(ori % 360);
  }




}