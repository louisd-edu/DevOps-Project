<script>
  import { onMount } from 'svelte';
  let isDark = false;
  onMount(() => {
    const theme_state = localStorage.getItem('theme');
    if (theme_state === 'dark') {
      isDark = true;
      document.documentElement.setAttribute('theme', 'dark-mode');
    }
  });
  function toggleTheme() {
    isDark = !isDark;
    if (isDark) {
      document.documentElement.setAttribute('theme', 'dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.removeAttribute('theme');
      localStorage.setItem('theme', 'light');
    }
  }
</script>
<style global>
  :root {
    --login-window-bg: linear-gradient(rgba(180, 180, 180, 0.25) 0%, rgba(235, 235, 235, 0.4) 100%);
    --text-colour: rgb(64, 53, 77);
    --text-field-bg: rgba(255, 255, 255, 0.85);
    --text-field-colour: rgb(0, 0, 0);
    --text-field-border: 1px solid #ccc;
    --login-btn-colour: linear-gradient(180deg, rgb(235, 235, 235) 0%, rgb(185, 185, 185) 100%);
    --text-colour-near: rgb(17, 17, 17);
    --register-text-colour: hsl(273, 61%, 95%);
    --register-border-colour: 1px solid hsl(268, 50%, 70%);
    --register-btn-colour: linear-gradient(180deg, rgb(137, 104, 176) 0%, rgb(83, 60, 110) 100%);
    --register-btn-shadow: 0 3px 6px rgba(0,0,0,0.25), inset 0px 0px 10px hsl(268, 80%, 75%);
  }

  [theme="dark-mode"] {
    --login-window-bg: linear-gradient(rgba(17, 17, 17, 0.25) 0%, rgba(48, 48, 48, 0.4) 100%);
    --text-colour: rgb(235, 235, 235);
    --text-field-bg: rgba(48, 48, 48, 0.85);
    --text-field-colour: rgb(235, 235, 235);
    --text-field-border: 1px solid rgb(96, 96, 96);
    --login-btn-colour: linear-gradient(180deg, rgb(235, 235, 235) 0%, rgb(185, 185, 185) 100%);
    --text-colour-near: rgb(235, 235, 235);
    --register-text-colour: hsl(268, 40%, 25%);
    --register-border-colour: 1px solid hsl(268, 50%, 75%);
    --register-btn-colour: linear-gradient(180deg, hsl(268, 50%, 71%) 0%, hsl(268, 40%, 61%) 100%);
    --register-btn-shadow: 0 3px 6px rgba(0,0,0,0.25), inset 0px 0px 10px hsl(268, 80%, 80%);
  }

  body {
    margin: 0;
    height: 100vh;
    background: linear-gradient(rgb(211, 175, 255) 0%, rgb(227, 204, 255) 50%, rgb(211, 175, 255) 50%, rgb(166, 96, 252) 100%) no-repeat center center fixed;
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
  }

  .login-window {
    width: 600px;
    background: var(--login-window-bg);
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

  .login-content, .register-content {
    flex: 1;
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .textField {
    box-sizing: border-box;
    width: 100%;
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
    width: 100%;
    background: #ccc;
    background: var(--login-btn-colour);
    border: none;
    color: var(--text-colour-near-black);
    padding: 10px 20px;
    font-size: 15px;
    font-weight: bold;
    border-radius: 6px;
    margin-top: 5px;
    cursor: pointer;
    box-shadow: 0 3px 6px rgba(0,0,0,0.25), inset 0px 0px 10px rgb(245, 245, 245);
  }

  #login-btn {
    color: hsl(273, 40%, 25%);
    border: 1px solid hsl(273, 50%, 93%);
    background: linear-gradient(180deg, rgb(231, 214, 245) 0%, rgb(219, 193, 240));
    box-shadow: 0 3px 6px rgba(0,0,0,0.25), inset 0px 0px 10px rgb(246, 235, 255);
  }

  #register-btn {
    color: var(--register-text-colour);
    border: var(--register-border-colour);
    background: var(--register-btn-colour);
    box-shadow: var(--register-btn-shadow);
  }

#theme-toggle {
  position: fixed;
  bottom: 20px;
  left: 20px;
  background: none;
  border: none;
  cursor: pointer;
  width: 48px;
  height: 48px;
  padding: 5px;
  border-radius: 50%;
  filter: drop-shadow(0 0 4px rgba(0, 0, 0, 0.35));
}

#theme-icon {
  width: 24px;
  height: 24px;
}
</style>
<body>
    <div class="login-window">
        <h1>Please Enter Your Credentials</h1>
        <div class="container">
            <div class="login-content">
                <form>
                    <input type="text" class="textField" placeholder="Username/E-Mail" required><br>
                    <input type="password" class="textField" placeholder="Password" required><br>
                    <input type="submit" class="buttons" id="login-btn" value="Login">
                </form>
            </div>
            <div class="register-content">
                <form>
                    <input type="text" class="textField" placeholder="E-Mail" required><br>
                    <input type="text" class="textField" placeholder="Username" required><br>
                    <input type="password" class="textField" placeholder="Password" required><br>
                    <input type="submit" class="buttons" id="register-btn" value="Register">
                </form>
            </div>
        </div>
    </div>
    
</body>
<footer>
    <button id="theme-toggle" aria-label="Toggle Theme" on:click={toggleTheme}>
        <img id="theme-icon" src={isDark ? '/images/dark_toggle.svg' : '/images/light_toggle.svg'} alt="Toggle theme"/>
    </button>
</footer>