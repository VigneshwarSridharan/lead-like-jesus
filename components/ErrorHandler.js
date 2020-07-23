import React from 'react'
import * as Sentry from '@sentry/react';

Sentry.init({dsn: "https://36241f220e6b4c6dbae5e3fc4d729912@o384713.ingest.sentry.io/5356076"});

class ErrorHandler extends React.Component {
    componentDidCatch(error, errorInfo) {
        alert('error')
        Sentry.withScope((scope) => {
            Object.keys(errorInfo).forEach((key) => {
                scope.setExtra(key, errorInfo[key]);
            });

            Sentry.captureException(error);
        });

        super.componentDidCatch(error, errorInfo);
    }

    render() {
        return this.props.children
    }
}

export default ErrorHandler