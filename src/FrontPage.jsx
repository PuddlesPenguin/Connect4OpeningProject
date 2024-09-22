import './index.css';
import Card from './Components.jsx';
import addOpeningLogo from './assets/treelogo.png';
import trainOpeningLogo from './assets/practice.jpg';
import playBotLogo from './assets/bot.jpg';
function FrontPage() {
  return (
    <>
      <header className="header">
            <h1>Connect 4 Opening Website</h1>

        </header>
      <div>
        <Card
          title="Add Openings"
          text="Add connect 4 openings to your database!"
          image={addOpeningLogo}
          link={<a href="#AddOpenings"></a>}
        />
        <Card
          title="Train Openings"
          text="Train from connect 4 openings in your database!"
          image={trainOpeningLogo}
          link={<a href="#TrainOpenings"></a>}
        />
        <Card
          title="Play Bot"
          text="Test yourself against a perfect connect 4 bot!"
          image={playBotLogo}
          link={<a href="#PlayBot"></a>}
        />
      </div>
    </>
  );
}

export default FrontPage;
