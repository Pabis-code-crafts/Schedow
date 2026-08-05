import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import type { PropsWithChildren, ReactNode } from 'react';
import { Component } from 'react';

type ErrorBoundaryProps = PropsWithChildren<{
  fallback?: ReactNode;
}>;

type ErrorBoundaryState = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <Alert severity="error">
            <AlertTitle>Something went wrong</AlertTitle>
            Please refresh the app and try again.
          </Alert>
        )
      );
    }

    return this.props.children;
  }
}
