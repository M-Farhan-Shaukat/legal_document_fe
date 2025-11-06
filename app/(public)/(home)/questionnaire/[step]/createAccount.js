const CeateAccount = () => {
  return (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <div style={{ width: "65%", padding: "2rem" }}>
        <h2>It's time to create an account.</h2>
        <p>You can log back in and finish anytime. Handy.</p>

        <button>Continue with Google</button>
        <p>or</p>

        <div>
          <label>Email Address</label>
          <input type="email" placeholder="Enter email" />
        </div>

        <div>
          <label>Password</label>
          <input type="password" placeholder="Enter password" />
          <small>Must be at least 8 characters</small>
        </div>

        <button>Continue →</button>
        <br />
        <button onClick={() => router.back()}>← Back</button>

        <p>⭐⭐⭐⭐⭐ Rated 4.8 stars on Google</p>

        <div>
          <p>🔒 Encrypted Data Storage</p>
          <p>✅ Safe Checkout</p>
          <small>
            All data is transferred using TLS1.2, encrypted using RSA/SHA-256,
            and stored in Canadian data centres.
          </small>
        </div>
      </div>

      {/* Right side – FAQ */}
      <div
        style={{
          width: "30%",
          background: "#7A5EE4",
          color: "white",
          padding: "1rem",
        }}
      >
        <h3>Info & Common Questions</h3>
        <ul>
          <li>Why do I need an account?</li>
          <li>Will you send me emails?</li>
          <li>Is my data secure?</li>
          <li>What if I change my mind?</li>
          <li>Will my spouse and I share an Epilogue account?</li>
        </ul>
        <div
          style={{
            background: "#d3cbe7",
            color: "black",
            padding: "0.5rem",
          }}
        >
          <strong>We're here to help</strong>
          <p>Contact our team via chat or call (289) 678-1689</p>
        </div>
      </div>
    </div>
  );
};

export default CeateAccount;
