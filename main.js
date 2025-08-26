 //writing these comments so i dont forget why i wrote what TT
        // Game variables
        let board;
        let boardWidth = 360;
        let boardHeight = 640;
        let context;
        
        // Bird
        let birdWidth = 34;
        let birdHeight = 24;
        let birdX = boardWidth / 8;
        let birdY = boardHeight / 2;
        let birdImg;
        let bird = {
            x: birdX,
            y: birdY,
            width: birdWidth,
            height: birdHeight
        };

        // Pipes
        let pipeArray = [];
        let pipeWidth = 64;
        let pipeHeight = 512;
        let pipeX = boardWidth;
        let pipeY = 0;
        let topPipeImg;
        let bottomPipeImg;

        // Game physics
        let velocityX = -2;
        let velocityY = 0;
        let gravity = 0.4;
        let gameOver = false;
        let gameStarted = false;
        let score = 0;
        let bestScore = localStorage.getItem("bestScore") || 0;
        let animationFrameId;

        window.onload = function() {
            board = document.getElementById("board");
            board.height = boardHeight;
            board.width = boardWidth;
            context = board.getContext("2d");
            
            birdImg = new Image();
            birdImg.src = "./flappybird.png"; 
            
            topPipeImg = new Image();
            topPipeImg.src = "./toppipe.png"; 
            
            bottomPipeImg = new Image();
            bottomPipeImg.src = "./bottompipe.png"; 

            // Start screen controls
            document.addEventListener("keydown", function(e) {
                if ((e.code === "Space" || e.code === "ArrowUp") && !gameStarted) {
                    startGame();
                }
            });
            //so it works on phone :3
            document.addEventListener("touchstart", function() {
                if (!gameStarted) {
                    startGame();
                }
            });
        };

        function startGame() {
            document.getElementById("start-screen").style.display = "none";
            gameStarted = true;
            gameOver = false;
            score = 0;
            pipeArray = [];
            bird.y = birdY;
            velocityY = 0;
            update();
            setInterval(placePipes, 1500);
            
            // Event listeners for gameplay
            document.addEventListener("keydown", function(e) {
                if (e.code === "Space" || e.code === "ArrowUp") {
                    jump();
                }
            });
            document.addEventListener("touchstart", jump);
        }

        function update() {
            if (!gameStarted || gameOver) return;
            
            animationFrameId = requestAnimationFrame(update);
            context.clearRect(0, 0, board.width, board.height);
            
            // Bird physics
            velocityY += gravity;
            bird.y += velocityY;
            bird.y = Math.max(bird.y, 0);
            
            // Draw bird with smooth rotation and we move the origin of canvas to the center of the bird
            context.save(); //saves current state of canvas cause of rotation n stufff
            context.translate(bird.x + bird.width/2, bird.y + bird.height/2);
            let rotation = Math.min(Math.max(velocityY * 0.05, -0.3), 0.3);
            context.rotate(rotation);
            context.drawImage(birdImg, -bird.width/2, -bird.height/2, bird.width, bird.height); //Since the origin is now at the center of the bird, we shift the image drawing by -bird.width/2 and -bird.height/2 so it is centered on the origin.
            context.restore();
            
            // Ground collision
            if (bird.y + bird.height > board.height) {
                endGame();
                return;
            }
            
            // Pipes logic
            for (let i = 0; i < pipeArray.length; i++) {
                let pipe = pipeArray[i];
                pipe.x += velocityX;
                context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);
                
                if (!pipe.passed && bird.x > pipe.x + pipe.width) {
                    score += 0.5;
                    pipe.passed = true;
                }
                
                if (detectCollision(bird, pipe)) {
                    endGame();
                    return;
                }
            }
            
            // Remove off-screen pipes
            while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
                pipeArray.shift();
            }
            
            // Score display
            context.fillStyle = "white";
            context.font = "bold 45px 'Press Start 2P', cursive";
            context.textAlign = "center";
            context.fillText(score.toString(), boardWidth/2, 60);
            context.textAlign = "left";
        }

        function placePipes() {
            if (gameOver) return;
            
            let randomPipeY = pipeY - pipeHeight/4 - Math.random() * (pipeHeight/2);
            let openingSpace = board.height/4;
            
            let topPipe = {
                img: topPipeImg,
                x: pipeX,
                y: randomPipeY,
                width: pipeWidth,
                height: pipeHeight,
                passed: false
            };
            pipeArray.push(topPipe);
            
            let bottomPipe = {
                img: bottomPipeImg,
                x: pipeX,
                y: randomPipeY + pipeHeight + openingSpace,
                width: pipeWidth,
                height: pipeHeight,
                passed: false
            };
            pipeArray.push(bottomPipe);
        }

        function jump() {
            if (!gameStarted){
                return;
            } 
            
            if (gameOver) {
                resetGame();
                return;
            }
            
            velocityY = -6;
        }

        function endGame() {
            gameOver = true;
            cancelAnimationFrame(animationFrameId);
            
            // Update best score
            bestScore = Math.max(score, bestScore);
            localStorage.setItem("bestScore", bestScore);
            
            // Game over screen
            context.fillStyle = "rgba(0, 0, 0, 0.7)";
            context.fillRect(0, 0, board.width, board.height);
            
            context.fillStyle = "#ff5252";
            context.font = "bold 36px 'Press Start 2P', cursive";
            context.textAlign = "center";
            context.fillText("GAME OVER", boardWidth/2, boardHeight/2 - 60);
            
            context.fillStyle = "white";
            context.font = "bold 24px 'Press Start 2P', cursive";
            context.fillText(`SCORE: ${score}`, boardWidth/2, boardHeight/2);
            context.fillText(`BEST: ${bestScore}`, boardWidth/2, boardHeight/2 + 40);
            
            context.fillStyle = "#ddd";
            context.font = "bold 15px 'Press Start 2P', cursive";
            context.fillText("PRESS SPACE TO RESTART", boardWidth/2, boardHeight/2 + 100);
        }

        function resetGame() {
            document.getElementById("start-screen").style.display = "none";
            gameOver = false;
            score = 0;
            pipeArray = [];
            bird.y = birdY;
            velocityY = 0;
            update();
        }

        function detectCollision(a, b) {
            return a.x < b.x + b.width &&
                   a.x + a.width > b.x &&
                   a.y < b.y + b.height &&
                   a.y + a.height > b.y;
        }