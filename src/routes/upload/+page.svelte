<style>
    :root {
        --upload-window-bg: linear-gradient(rgba(180, 180, 180, 0.25) 0%, rgba(235, 235, 235, 0.4) 100%);
        --text-colour: rgb(64, 53, 77);
        --btn-colour: linear-gradient(180deg, rgb(235, 235, 235) 0%, rgb(185, 185, 185) 100%);
        --btn-colour-hover: linear-gradient(180deg, hsl(0, 0%, 87%) 0%, hsl(0, 0%, 68%) 100%);
        --text-field-bg: rgba(255, 255, 255, 0.85);
        --text-field-colour: rgb(0, 0, 0);
        --text-field-border: 1px solid #ccc;
        --text-colour-near-black: rgb(17, 17, 17);
        --item-width: 500px;
    }

    body {
        margin: 0;
        height: 100vh;
        background: rgb(179, 255, 190) no-repeat center center fixed;
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
    width: auto;
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

  .container {
    display: flex;
    justify-content: space-around;
    align-items: flex-end;
    width: 100%;
    gap: 40px;
    flex: 1;
  }
  
  .textField {
    box-sizing: border-box;
    width: var(--item-width);
    padding: 10px;
    border-radius: 6px;
    border: var(--text-field-border);
    margin: 5px auto;
    font-size: 14px;
    background: var(--text-field-bg);
    box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);
  }

  .buttons {
    box-sizing: border-box;
    width: var(--item-width);
    background: #ccc;
    background: var(--btn-colour);
    border: none;
    color: var(--text-colour-near-black);
    padding: 10px 20px;
    font-size: 15px;
    font-weight: bold;
    border-radius: 6px;
    margin-top: 5px;
    cursor: pointer;
    box-shadow: 0 3px 6px rgba(0,0,0,0.25), inset 0px 0px 10px hsl(0, 0%, 96%);
  }

  .buttons:hover {
    background: var(--btn-colour);
    filter: contrast(107%) brightness(105%);
    box-shadow: 0 3px 6px rgba(0,0,0,0.25), inset 0px 0px 15px hsl(0, 0%, 100%);
  }
</style>

<body>
    <div class="container">
        <div class="upload-window">
            <h1>Upload New Recipe</h1>
            <form>
                <input type="img-upload" class="buttons" value="Upload Image"><br>
                <input type="text" class="textField" placeholder="Recipe Name" required><br>
                <input type="text" class="textField" placeholder="Time to Make (e.g. 40 minutes)" required><br>
                <input type="text" class="textField" placeholder="Instructions" required><br>
                <input type="submit" class="buttons" value="Submit">
            </form>
        </div>
    </div>
</body>