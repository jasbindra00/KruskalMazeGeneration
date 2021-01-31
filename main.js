class Vector2
{
    constructor(x, y)
    {
        this.x = x;
        this.y = y;
    }
    static add(vec1, vec2)
    {
        return new Vector2(vec1.x + vec2.x, vec1.y + vec2.y);
    }
    static mult(vec, scalar)
    {
        return new Vector2(vec.x*scalar, vec.y*scalar);
    }
    static compare(vec1, vec2)
    {
        return (vec1.x == vec2.x) && (vec1.y == vec2.y);
    }
    static print(vec1)
    {
        console.log("{" + vec1.x.toString() + "," + vec1.y.toString() + "}");
    }
}
class Line
{
    constructor(start, end)
    {
        this.start = start;
        this.end = end;
    }
    static compare(line1, line2)
    {
        return Vector2.compare(line1.start, line2.start) && Vector2.compare(line1.end, line2.end);

    }
}
class Block
{
    constructor(top_left, grid_dim)
    {
        this.top_left = top_left;
        this.walls =
        {
            "N" : new Line(top_left, Vector2.add(top_left, new Vector2(grid_dim,0))),
            "E" : new Line(Vector2.add(top_left, new Vector2(grid_dim, 0)), Vector2.add(Vector2.add(top_left, new Vector2(grid_dim, 0)), new Vector2(0, grid_dim))),
            "S" : new Line(Vector2.add(Vector2.add(top_left, new Vector2(grid_dim, 0)), new Vector2(0, grid_dim)), Vector2.add(top_left, new Vector2(0, grid_dim))),
            "W" : new Line(Vector2.add(top_left, new Vector2(0, grid_dim)), top_left)
        };
        this.visited = false;
    }
    get_walls()
    {
        return this.walls;
    }
    remove_wall(cardinal)
    {
        if(this.walls.hasOwnProperty(cardinal))
        {
            delete this.walls[cardinal];
        }
    }
}
class kruskal
{
    constructor()
    {
    }
    reset(block_dimension,canvas)
    {

        this.grid_space = [];
        this.visited_stack = [];
        this.grid_dim = block_dimension;
        this.current_grid_pos = new Vector2(0,0);
    
        //Initialise the grid space with a fixed number of blocks;
        for(var y = 0; y < canvas.height; y+=this.grid_dim)
        {
            //Create a new row.
            this.grid_space.push([]);
            for(var x = 0; x < canvas.width; x+=this.grid_dim)
            {
                //Add a block to that row.
                this.grid_space[this.grid_space.length - 1].push(new Block(new Vector2(x,y), this.grid_dim));
            }
        }
        //Add the first block onto the visited stack.
        this.visited_stack.push(new Vector2(0,0));
        this.grid_space[0][0].visited = true;
        
    }
    remove_walls(block_1, block_2)
    {
        //Obtain the vector from the first block to the second block.
        var direction = this.world_to_grid_position(Vector2.add(block_1.top_left, Vector2.mult(block_2.top_left,-1)));
 
        if(direction.x == 0)
        {
            if(direction.y == -1)
            {
                //console.log("south");
                //Remove the south wall of block 1 and the north wall of block 2.
                block_1.remove_wall("S");
                block_2.remove_wall("N");
            }
            else if(direction.y == 1)
            {
                //console.log("north");
                block_1.remove_wall("N");
                block_2.remove_wall("S");
            }
        }
        else if(direction.y == 0)
        {
            if(direction.x == -1)
            {
                //console.log("east");
                block_1.remove_wall("E");
                block_2.remove_wall("W");
            }
            else if (direction.x == 1)
            {
                //console.log("west");
                block_1.remove_wall("W");
                block_2.remove_wall("E");
            }
        }

    }

    world_to_grid_position(position)
    {
        return new Vector2(Math.floor(position.x / this.grid_dim), Math.floor(position.y / this.grid_dim));

    }
    random_neighbor(block)
    {
        //Iterate through each of the unvisited neighbors.
        var cardinal_directions = [new Vector2(0, -1), new Vector2(1, 0), new Vector2(0, 1), new Vector2(-1,0)];
        var valid_neighbors = [];
        //Iterate through each of the cardinal positions.
        for(var cardinal_direction of cardinal_directions)
        {
            //Find the grid position at cardinal.
            var neighbor_position = Vector2.add(this.world_to_grid_position(block.top_left), cardinal_direction);
            //Check if the grid position is valid.
            if(neighbor_position.x < 0 || neighbor_position.x >= this.grid_space[0].length || neighbor_position.y < 0 || neighbor_position.y >= this.grid_space.length) continue;
            //Get the neighboring block.
            var neighboring_block = this.grid_space[neighbor_position.y][neighbor_position.x];
            //Check if it has been visited.
            if(neighboring_block.visited) continue;
            //Push it.
            valid_neighbors.push(neighbor_position);
        }
        //No neighbors
        if(valid_neighbors.length == 0)
        {
            return new Vector2(-1,-1);
        }
        //Choose a random index.
        var rand =  Math.floor(Math.random() * Math.floor(valid_neighbors.length));
        return valid_neighbors[rand];
    }

    render_line(canvas_context, start, end)
    {
        canvas_context.strokeStyle = 'red';
        canvas_context.beginPath();
        canvas_context.moveTo(start.x, start.y);
        canvas_context.lineTo(end.x,end.y);
        canvas_context.stroke();
    }
    render(canvas_context)
    {
        //Initialise the canvas background.
        canvas_context.fillStyle = 'black';
        canvas_context.fillRect(0,0,canvas.width, canvas.height);
        for(var y = 0; y < this.grid_space.length; y++)
        {

            for(var x = 0; x < this.grid_space[0].length; x++)
            {
                var block = this.grid_space[y][x];
                var walls = block.get_walls();
                for(var key in walls)
                {
                    var wall = walls[key];
                    this.render_line(canvas_context, wall.start, wall.end);
                }
            }

        }
    }
    initkruskal(grid_dim, canvas)
    {
        this.reset(grid_dim, canvas);
        //this.remove_walls(this.grid_space[0][0], this.grid_space[1][0]);
        //Set the current_position;
        
        this.start(canvas.getContext("2d"));
        //console.log(this.visited_stack.length);
    }
    start(canvas_context)
    {
        //Vector2.print(this.current_grid_pos);
        var current_block = this.grid_space[this.current_grid_pos.y][this.current_grid_pos.x];
        var random_neighbor_grid_pos = this.random_neighbor(current_block);
        //this.render(canvas_context);
        if(random_neighbor_grid_pos.x != -1 && random_neighbor_grid_pos.y != -1)
        {
            var next_block = this.grid_space[random_neighbor_grid_pos.y][random_neighbor_grid_pos.x];
            next_block.visited = true;
            this.visited_stack.push(random_neighbor_grid_pos);
            this.remove_walls(current_block, next_block);
            this.current_grid_pos = random_neighbor_grid_pos;
            this.start(canvas_context);
        }
        else if (this.visited_stack.length > 0)
        {
            current_block.visited = true;
            this.visited_stack.pop();
            if(this.visited_stack.length != 0)
            {
                this.current_grid_pos = this.visited_stack[this.visited_stack.length - 1];
                this.start(canvas_context);
            }
        }
    }

}
