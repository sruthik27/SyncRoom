import FileUpload from "./FileUpload";
import { mount } from "cypress/react18";
import "cypress-file-upload";

describe("FileUpload", () => {
  let handleFileChange;
  let handleUpload;

  beforeEach(() => {
    handleFileChange = cy.stub();
    handleUpload = cy.stub().resolves();

    mount(
      <FileUpload
        handleFileChange={handleFileChange}
        handleUpload={handleUpload}
      />,
    );
  });

  it("should render the file upload component", () => {
    cy.getByTestId("file-upload").should("exist");
  });

  it("should render the choose songs button", () => {
    cy.getByTestId("choose-songs-button").should("exist");
  });

  it("should open file input when choose songs button is clicked", () => {
    cy.getByTestId("choose-songs-button").click();
    cy.getByTestId("file-input").should("exist");
  });

  it("should handle file input change", () => {
    cy.getByTestId("file-input").attachFile("sample.mp3");
    cy.wrap(handleFileChange).should("have.been.called");
  });

  it("should handle drag and drop", () => {
    cy.getByTestId("drop-area").trigger("dragenter");
    cy.getByTestId("drop-area").trigger("drop", {
      dataTransfer: {
        files: [new File(["sample"], "sample.mp3", { type: "audio/mp3" })],
      },
    });
    cy.wrap(handleFileChange).should("have.been.called");
  });

  it("should render the file list", () => {
    cy.getByTestId("file-input").attachFile("sample.mp3");
    cy.getByTestId("file-list").should("exist");
    cy.getByTestId("file-item-0").should("exist");
  });

  it("should remove a file from the list", () => {
    cy.getByTestId("file-input").attachFile("sample.mp3");
    cy.getByTestId("remove-file-button-0").click();
    cy.getByTestId("file-item-0").should("not.exist");
  });

  it("should handle upload button click", () => {
    cy.getByTestId("file-input").attachFile("sample.mp3");
    cy.getByTestId("upload-button").click();
    cy.wrap(handleUpload).should("have.been.called");
  });
});
