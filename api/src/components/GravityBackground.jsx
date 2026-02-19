import React from "react";
import Particles from "@tsparticles/react";

const GravityBackground = () => {
  

  const options = {
    fullScreen: { enable: true },

    background: {
      color: "#060b1f"
    },

    particles: {
      number: { value: 60 },
      size: { value: 6 },      // BIG so you can’t miss them
      move: { enable: true, speed: 2 },
      color: { value: "#ffffff" }
    }
  };

  return (
    <Particles
      id="tsparticles"
      options={options}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: -1
      }}
    />
  );
};

export default GravityBackground;
