import { Link } from "react-router-dom";

const Home = () => {
  return (
    <main className="home-page">

      {/* HERO */}

      <section className="home-hero">

        <div className="hero-content">

          <span className="hero-label">
            A NEW WAY TO SHOP
          </span>

          <h1>
            Discover More.
            <br />
            <span>Choose Better.</span>
          </h1>

          <p>
            Explore products thoughtfully selected for
            quality, style and everyday life.
          </p>

          <div className="hero-buttons">

            <Link
              to="/shop"
              className="hero-primary"
            >
              Explore Collection →
            </Link>

            <Link
              to="/register"
              className="hero-secondary"
            >
              Join AROVA
            </Link>

          </div>

        </div>

        <div className="hero-visual">

          <div className="hero-circle"></div>

          <div className="hero-card hero-card-one">
            <span>01</span>
            <strong>DISCOVER</strong>
          </div>

          <div className="hero-card hero-card-two">
            <span>02</span>
            <strong>CHOOSE</strong>
          </div>

          <div className="hero-product">
            AROVA
          </div>

        </div>

      </section>

      {/* FEATURE STRIP */}

      <section className="home-features">

        <div>
          <span>01</span>
          <h3>Curated Products</h3>
          <p>Discover products worth choosing.</p>
        </div>

        <div>
          <span>02</span>
          <h3>Smart Shopping</h3>
          <p>Search, compare and decide better.</p>
        </div>

        <div>
          <span>03</span>
          <h3>Easy Checkout</h3>
          <p>A simple and secure buying experience.</p>
        </div>

      </section>

      {/* CTA */}

      <section className="home-cta">

        <p>AROVA</p>

        <h2>
          Your next favourite
          <br />
          is waiting.
        </h2>

        <Link to="/shop">
          Start Exploring →
        </Link>

      </section>

    </main>
  );
};

export default Home;