<script>
</script>

<style>
  .auth-page {
    --login-window-bg: linear-gradient(rgba(220, 252, 231, 0.3) 0%, rgba(240, 253, 244, 0.5) 100%);
    --text-colour: rgb(31, 41, 55);
    --text-field-bg: rgba(255, 255, 255, 0.9);
    --text-field-colour: rgb(17, 24, 39);
    --text-field-border: 1px solid #d1d5db;
    --login-btn-colour: linear-gradient(180deg, #f3f4f6 0%, #e5e7eb 100%);
    --text-colour-near: rgb(17, 24, 39);
    --register-text-colour: rgb(255, 255, 255);
    --register-border-colour: 1px solid #22c55e;
    --register-btn-colour: linear-gradient(180deg, #4ade80 0%, #22c55e 100%);
    --register-btn-shadow: 0 3px 6px rgba(0,0,0,0.15), inset 0px 0px 10px rgba(134, 239, 172, 0.5);
  }

  @media (prefers-color-scheme: dark) {
    .auth-page {
      --login-window-bg: linear-gradient(rgba(31, 41, 55, 0.4) 0%, rgba(55, 65, 81, 0.5) 100%);
      --text-colour: rgb(243, 244, 246);
      --text-field-bg: rgba(55, 65, 81, 0.9);
      --text-field-colour: rgb(243, 244, 246);
      --text-field-border: 1px solid rgb(75, 85, 99);
      --login-btn-colour: linear-gradient(180deg, #4b5563 0%, #374151 100%);
      --text-colour-near: rgb(243, 244, 246);
      --register-text-colour: rgb(17, 24, 39);
      --register-border-colour: 1px solid #4ade80;
      --register-btn-colour: linear-gradient(180deg, #86efac 0%, #4ade80 100%);
      --register-btn-shadow: 0 3px 6px rgba(0,0,0,0.3), inset 0px 0px 10px rgba(74, 222, 128, 0.3);
    }
  }

  .auth-page {
    min-height: 100vh;
    width: 100vw;
    background: linear-gradient(135deg, #dcfce7 0%, #d9f99d 25%, #bbf7d0 50%, #86efac 75%, #4ade80 100%) no-repeat center center;
    background-size: 200% 200%;
    animation: gradientShift 15s ease infinite;
    font-family: system-ui, -apple-system, sans-serif;
    color: var(--text-colour);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    position: fixed;
    top: 0;
    left: 0;
    overflow-y: auto;
  }

  .back-button {
    position: fixed;
    top: 20px;
    left: 20px;
    z-index: 100;
    padding: 12px 20px;
    background: rgba(255, 255, 255, 0.9);
    border: 1px solid rgba(209, 213, 219, 0.5);
    border-radius: 12px;
    text-decoration: none;
    color: #374151;
    font-weight: 500;
    backdrop-filter: blur(10px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .back-button:hover {
    background: rgba(255, 255, 255, 1);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
    color: #22c55e;
  }

  @media (prefers-color-scheme: dark) {
    .back-button {
      background: rgba(31, 41, 55, 0.9);
      border-color: rgba(75, 85, 99, 0.5);
      color: #e5e7eb;
    }

    .back-button:hover {
      background: rgba(31, 41, 55, 1);
      color: #4ade80;
    }
  }

  @keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  h1 {
    margin-bottom: 20px;
    font-weight: bold;
    text-align: center;
    font-size: 2rem;
    color: var(--text-colour);
    text-shadow: none;
  }

  .login-window {
    width: 90%;
    max-width: 600px;
    background: var(--login-window-bg);
    border-radius: 16px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.5);
    backdrop-filter: blur(20px);
    overflow: hidden;
    border: 1px solid rgba(220, 252, 231, 0.5);
    padding: 40px 30px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  @media (prefers-color-scheme: dark) {
    .login-window {
      border: 1px solid rgba(55, 65, 81, 0.5);
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(75, 85, 99, 0.3);
    }
  }

  .container {
    display: flex;
    justify-content: space-around;
    align-items: stretch;
    width: 100%;
    gap: 40px;
    flex: 1;
    position: relative;
  }

  .container::before {
    content: '';
    position: absolute;
    left: 50%;
    top: 10%;
    bottom: 10%;
    width: 1px;
    background: linear-gradient(to bottom, transparent, rgba(209, 213, 219, 0.5), transparent);
    transform: translateX(-50%);
  }

  @media (prefers-color-scheme: dark) {
    .container::before {
      background: linear-gradient(to bottom, transparent, rgba(75, 85, 99, 0.5), transparent);
    }
  }

  @media (max-width: 600px) {
    .container {
      flex-direction: column;
      gap: 30px;
    }

    .container::before {
      left: 10%;
      right: 10%;
      top: 50%;
      bottom: auto;
      width: auto;
      height: 1px;
      background: linear-gradient(to right, transparent, rgba(209, 213, 219, 0.5), transparent);
    }
  }

  .login-content, .register-content {
    flex: 1;
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    gap: 8px;
  }

  .login-content h2, .register-content h2 {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 8px;
    color: var(--text-colour);
  }

  .textField {
    box-sizing: border-box;
    width: 100%;
    padding: 12px 14px;
    border-radius: 8px;
    border: var(--text-field-border);
    margin: 5px auto;
    font-size: 14px;
    background: var(--text-field-bg);
    box-shadow: inset 0 1px 3px rgba(0,0,0,0.08);
    color: var(--text-field-colour);
    transition: all 0.2s ease;
    outline: none;
  }

  .textField:focus {
    border-color: #22c55e;
    box-shadow: inset 0 1px 3px rgba(0,0,0,0.08), 0 0 0 3px rgba(34, 197, 94, 0.1);
  }

  .textField::placeholder {
    color: #9ca3af;
  }

  @media (prefers-color-scheme: dark) {
    .textField::placeholder {
      color: #6b7280;
    }
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
    color: #374151;
    border: 1px solid #d1d5db;
    background: linear-gradient(180deg, #f9fafb 0%, #f3f4f6 100%);
    box-shadow: 0 3px 6px rgba(0,0,0,0.1), inset 0px 0px 10px rgba(255, 255, 255, 0.8);
    transition: all 0.2s ease;
  }

  #login-btn:hover {
    background: linear-gradient(180deg, #f3f4f6 0%, #e5e7eb 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.15), inset 0px 0px 10px rgba(255, 255, 255, 0.8);
  }

  #register-btn {
    color: var(--register-text-colour);
    border: var(--register-border-colour);
    background: var(--register-btn-colour);
    box-shadow: var(--register-btn-shadow);
    transition: all 0.2s ease;
  }

  #register-btn:hover {
    background: linear-gradient(180deg, #22c55e 0%, #16a34a 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 10px rgba(34, 197, 94, 0.3), inset 0px 0px 12px rgba(134, 239, 172, 0.6);
  }
</style>

<a href="/" class="back-button">
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.5 5L7.5 10L12.5 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    Back to Home
</a>

<div class="auth-page">
    <div class="login-window">
        <h1>Welcome to YumLog</h1>
        <div class="container">
            <div class="login-content">
                <h2>Login</h2>
                <form method="POST" action="?/login">
                    <input type="email" name="email"  class="textField" placeholder="Email" required>
                    <input type="password" name="password" class="textField" placeholder="Password" required>
                    <input type="submit" class="buttons" id="login-btn" value="Sign In">
                </form>
            </div>
            <div class="register-content">
                <h2>Register</h2>
                <form method="POST" action="?/signup">
                    <input type="email" name="email" class="textField" placeholder="Email Address" required>
                    <input type="password" name="password"  class="textField" placeholder="Password" required>
                    <input type="submit" class="buttons" id="register-btn" value="Create Account">
                </form>
            </div>
        </div>
    </div>
</div>