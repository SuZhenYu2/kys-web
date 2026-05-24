class GameMap {
    constructor() {
        this.mapId = 'xiangyang';
        this.name = '襄阳城';
        this.width = 100;
        this.height = 100;
        this.tileSize = 32;
        this.tiles = [];
        this.backgroundColor = '#2d4a3e';
    }
    
    loadMapData(mapData) {
        this.mapId = mapData.mapId;
        this.name = mapData.name;
        this.description = mapData.description;
        this.width = mapData.width;
        this.height = mapData.height;
        this.tiles = mapData.tiles;
        if (mapData.backgroundColor) {
            this.backgroundColor = mapData.backgroundColor;
        }
    }
    
    getTile(x, y) {
        return this.tiles.find(t => t.x === x && t.y === y);
    }
    
    isWalkable(x, y) {
        const tile = this.getTile(x, y);
        return tile ? tile.walkable : true;
    }
}
