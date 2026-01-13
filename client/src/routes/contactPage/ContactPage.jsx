import "./contactPage.css";

const ContactPage = () => {
  return (
    <div className="contactPage">
      <div className="contactContainer">
        <div className="header">
          <div className="avatar">
            <span>PY</span>
          </div>
          <h1>Get In Touch</h1>
          <p>
            Feel free to reach out for any project inquiries or collaborations
          </p>
        </div>

        <div className="contactInfo">
          <div className="infoCard">
            <div className="icon">👨‍💻</div>
            <h3>Developer</h3>
            <p>Pyush Yadav</p>
          </div>

          <div className="infoCard">
            <div className="icon">📧</div>
            <h3>Email</h3>
            <p>pyushyadav107@gmail.com</p>
            <a href="mailto:pyushyadav107@gmail.com" className="contactButton">
              Send Email
            </a>
            <div className="status">
              <div className="statusIndicator"></div>
              <span>Available for hire</span>
            </div>
          </div>

          <div className="infoCard techCard">
            <div className="icon">⚡</div>
            <h3>Full Tech Stack</h3>
            <p>
              Production-ready AI chat application with enterprise architecture
            </p>

            <div className="techSection">
              <h4>🎨 Frontend</h4>
              <div className="techList">
                <span className="tech">React 19 (RC)</span>
                <span className="tech">Vite</span>
                <span className="tech">TanStack Query</span>
                <span className="tech">React Router</span>
                <span className="tech">Clerk React</span>
              </div>
            </div>

            <div className="techSection">
              <h4>🚀 Backend</h4>
              <div className="techList">
                <span className="tech">Node.js</span>
                <span className="tech">Express.js</span>
                <span className="tech">MongoDB</span>
                <span className="tech">Mongoose ODM</span>
                <span className="tech">Clerk SDK</span>
              </div>
            </div>

            <div className="techSection">
              <h4>🤖 AI & Services</h4>
              <div className="techList">
                <span className="tech">Google Gemini AI</span>
                <span className="tech">ImageKit</span>
                <span className="tech">Real-time Streaming</span>
              </div>
            </div>

            
          </div>
        </div>

        <div className="footer">
          <div className="socialLinks">
            <a
              href="https://linkedin.com/in/pyush-yadav-933071348"
              target="_blank"
              rel="noopener noreferrer"
              className="socialButton"
            >
              💼 LinkedIn
            </a>
            <a
              href="https://github.com/Pyush-10"
              target="_blank"
              rel="noopener noreferrer"
              className="socialButton"
            >
              👨‍💻 GitHub
            </a>
            
          </div>
          <p>Let's build something amazing together!</p>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
