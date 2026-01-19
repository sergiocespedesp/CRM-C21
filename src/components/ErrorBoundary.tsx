import React, { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
        this.setState({
            error,
            errorInfo
        });
    }

    handleReload = () => {
        window.location.reload();
    };

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        });
    };

    render() {
        if (this.state.hasError) {
            const isDev = import.meta.env.DEV;

            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                    <div className="max-w-2xl w-full">
                        <div className="bg-white rounded-lg shadow-lg p-8">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                                    <AlertTriangle className="w-8 h-8 text-red-600" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">
                                        Â¡Oops! Algo saliÃ³ mal
                                    </h1>
                                    <p className="text-gray-600 mt-1">
                                        La aplicaciÃ³n encontrÃ³ un error inesperado
                                    </p>
                                </div>
                            </div>

                            {isDev && this.state.error && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded">
                                    <h3 className="font-semibold text-red-900 mb-2">Error Details (Dev Mode):</h3>
                                    <p className="text-sm text-red-800 font-mono mb-2">
                                        {this.state.error.toString()}
                                    </p>
                                    {this.state.errorInfo && (
                                        <details className="text-xs text-red-700">
                                            <summary className="cursor-pointer font-semibold mb-1">
                                                Component Stack
                                            </summary>
                                            <pre className="whitespace-pre-wrap overflow-auto max-h-64 p-2 bg-white rounded">
                                                {this.state.errorInfo.componentStack}
                                            </pre>
                                        </details>
                                    )}
                                </div>
                            )}

                            <div className="space-y-3">
                                <p className="text-gray-700">
                                    Puedes intentar las siguientes acciones:
                                </p>
                                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-2">
                                    <li>Recargar la pÃ¡gina</li>
                                    <li>Limpiar el cachÃ© del navegador</li>
                                    <li>Contactar al soporte tÃ©cnico si el problema persiste</li>
                                </ul>
                            </div>

                            <div className="flex gap-3 mt-8">
                                <button
                                    onClick={this.handleReload}
                                    className="btn btn-primary gap-2 flex-1"
                                >
                                    <RefreshCw size={16} />
                                    Recargar PÃ¡gina
                                </button>
                                <button
                                    onClick={this.handleReset}
                                    className="btn btn-outline flex-1"
                                >
                                    Intentar Continuar
                                </button>
                            </div>

                            {!isDev && (
                                <p className="text-xs text-gray-500 mt-6 text-center">
                                    Error ID: {Date.now().toString(36)}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
