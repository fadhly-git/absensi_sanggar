import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    private handleRetry = () => {
        this.setState({ hasError: false, error: undefined });
    };

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <Card className="mx-auto max-w-md">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                            <AlertTriangle className="h-6 w-6 text-red-600" />
                        </div>
                        <CardTitle className="text-lg font-semibold text-red-900">
                            Terjadi Kesalahan
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Maaf, terjadi kesalahan yang tidak terduga. Silakan coba lagi.
                        </p>
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className="text-left">
                                <summary className="cursor-pointer text-sm font-medium">
                                    Detail Error (Development)
                                </summary>
                                <pre className="mt-2 whitespace-pre-wrap text-xs text-red-600 bg-red-50 p-2 rounded">
                                    {this.state.error.stack}
                                </pre>
                            </details>
                        )}
                        <Button onClick={this.handleRetry} variant="outline" size="sm">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Coba Lagi
                        </Button>
                    </CardContent>
                </Card>
            );
        }

        return this.props.children;
    }
}