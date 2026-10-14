
import React, { useEffect, useState } from "react";
import Icon from "./Icon";
import "../styles/story-slider.css";

import photo1 from "../assets/story-1.webp";
import photo2 from "../assets/story-2.webp";
import photo3 from "../assets/story-3.webp";
import photo4 from "../assets/story-4.webp";
import photo5 from "../assets/story-5.webp";
import photo6 from "../assets/story-6.webp";

const scenes = [
  {
    image: photo1,
    title: "When Every Second Matters",
    text: "A patient fights for life while her family waits for hope."
  },
  {
    image: photo2,
    title: "A Family's Silent Prayer",
    text: "One question remains: will someone come forward to help?"
  },
  {
    image: photo3,
    title: "One Decision Changes Everything",
    text: "A young student sees an urgent request and chooses to help."
  },
  {
    image: photo4,
    title: "The Gift of Blood",
    text: "A compassionate donor gives blood with professional care."
  },
  {
    image: photo5,
    title: "From Donation to Care",
    text: "Donated blood is tested, prepared and matched for patients."
  },
  {
    image: photo6,
    title: "Hope Finds Its Way Home",
    text: "A patient receives care, bringing relief to her family."
  }
];

const DURATION = 2400;

export default function StorySlider() {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPlaying(false);
    }
  }, []);

  useEffect(() => {
    if (!playing) return;

    const timer = window.setInterval(() => {
      setActive(previous => (previous + 1) % scenes.length);
    }, DURATION);

    return () => window.clearInterval(timer);
  }, [playing]);

  const current = scenes[active];

  return (
    <div className="bc-flow-slider" aria-label="Blood donation story">
      <div className="bc-hero-visual bc-flow-frame">
        {scenes.map((scene, index) => (
          <img
            key={index}
            src={scene.image}
            alt=""
            loading="eager"
            decoding="async"
            className={`bc-flow-photo ${
              index === active ? "is-current" : ""
            }`}
          />
        ))}

        <button
          type="button"
          className="bc-flow-control"
          onClick={() => setPlaying(value => !value)}
          aria-label={playing ? "Pause story" : "Play story"}
        >
          <Icon name={playing ? "pause" : "play"} size={16} />
        </button>
      </div>

      <div className="bc-flow-caption" key={active} aria-live="off">
        <strong>{current.title}</strong>
        <p>{current.text}</p>
      </div>
    </div>
  );
}
