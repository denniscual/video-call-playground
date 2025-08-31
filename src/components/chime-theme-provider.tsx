import React from "react";
import { ThemeProvider } from "styled-components";
import { lightTheme } from "amazon-chime-sdk-component-library-react";

interface IProps {
  children?: React.ReactNode;
}

const ChimeThemeProvider: React.FC<IProps> = ({ children }) => {
  return <ThemeProvider theme={lightTheme}>{children}</ThemeProvider>;
};

export default ChimeThemeProvider;
