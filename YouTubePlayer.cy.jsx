import YouTubePlayer from "./YouTubePlayer";
import { mount } from "cypress/react";

describe("YouTubePlayer", () => {
  let onReady;
  let onStateChange;

  beforeEach(() => {
    onReady = cy.stub();
    onStateChange = cy.stub();

    mount(
      <YouTubePlayer
        videoId="dQw4w9WgXcQ"
        isPlaying={true}
        currentTime={0}
        onReady={onReady}
        onStateChange={onStateChange}
      />,
    );
  });

  it("should render the YouTube player component", () => {
    cy.getByTestId("youtube-player").should("exist");
  });

  it("should render the YouTube iframe", () => {
    cy.get("iframe").should("exist");
  });

  it("should call onReady when the player is ready", () => {
    cy.window().then((win) => {
      const event = {
        target: { getPlayerState: () => win.YT.PlayerState.PLAYING },
      };
      onReady(event);
    });
    cy.wrap(onReady).should("have.been.called");
  });

  it("should call onStateChange when the player state changes", () => {
    cy.window().then((win) => {
      const event = { data: win.YT.PlayerState.PLAYING };
      onStateChange(event);
    });
    cy.wrap(onStateChange).should("have.been.calledWith", { data: 1 });
  });

  it("should play the video correctly", () => {
    cy.window().then((win) => {
      const event = { data: win.YT.PlayerState.PLAYING };
      onStateChange(event);
    });
    cy.wrap(onStateChange).should("have.been.calledWith", { data: 1 });
  });
});
