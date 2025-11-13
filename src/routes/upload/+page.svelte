<style>
    ::root {
        --upload-window-bg: linear-gradient(rgba(180, 180, 180, 0.25) 0%, rgba(235, 235, 235, 0.4) 100%);
        --text-colour: rgb(64, 53, 77);
    }

    body {
    margin: 0;
    height: 100vh;
    background: rgb(255, 255, 255) no-repeat center center fixed;
    background-size: 100%;
    background-attachment: fixed;
    font-family: "Helvetica";
    color: var(--text-colour);
    text-shadow: 0px 0px 20px rgba(0,0,0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  h1 {
    margin-bottom: 10px;
    font-weight: bold;
    text-align: center;
    font-size: 3vh;
  }

  .upload-window {
    width: 600px;
    background: var(--upload-window-bg);
    border-radius: 10px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(10px);
    overflow: hidden;
    border: 1px solid rgba(245, 245, 245, 0.35);
    padding: 30px 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
</style>

<body>
    <div class="upload-window">
        <h1>Upload New Recipe</h1>
        <form>
            <input type="text" class="textField" placeholder="Recipe Name" required><br>
            <input type="text" class="textField" placeholder="Time to Make (e.g. 40 minutes)" required><br>
            <input type="text" class="textField" placeholder="Instructions" required><br>
            <input type="submit" class="buttons" value="Upload">
        </form>
    </div>
</body>