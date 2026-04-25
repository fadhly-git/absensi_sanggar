import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import CMSLayout from '@/layouts/cms/cms-layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Activity, Code, Send, Loader2, Clock, Trash2 } from 'lucide-react';
import axios, { AxiosError } from 'axios';

interface HistoryItem {
    id: string;
    timestamp: number;
    url: string;
    method: HttpMethod;
    headers: string;
    body: string;
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export default function DevToolsIndex() {
    const [url, setUrl] = useState('');
    const [method, setMethod] = useState<HttpMethod>('GET');
    const [headers, setHeaders] = useState('{\n  "Accept": "application/json",\n  "Content-Type": "application/json"\n}');
    const [body, setBody] = useState('{\n  \n}');
    const [history, setHistory] = useState<HistoryItem[]>([]);

    // Load cached config and history on mount
    useEffect(() => {
        const cachedConfig = localStorage.getItem('api_tester_config');
        if (cachedConfig) {
            try {
                const parsed = JSON.parse(cachedConfig);
                if (parsed.url) setUrl(parsed.url);
                if (parsed.method) setMethod(parsed.method);
                if (parsed.headers) setHeaders(parsed.headers);
                if (parsed.body) setBody(parsed.body);
            } catch (e) {
                console.error('Failed to parse cached API Tester config');
            }
        }

        const cachedHistory = localStorage.getItem('api_tester_history');
        if (cachedHistory) {
            try {
                setHistory(JSON.parse(cachedHistory));
            } catch (e) {
                console.error('Failed to parse cached API Tester history');
            }
        }
    }, []);

    // Save config whenever inputs change
    useEffect(() => {
        localStorage.setItem(
            'api_tester_config',
            JSON.stringify({ url, method, headers, body })
        );
    }, [url, method, headers, body]);

    // Save history whenever it changes
    useEffect(() => {
        localStorage.setItem('api_tester_history', JSON.stringify(history));
    }, [history]);

    const addToHistory = (item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
        const newItem: HistoryItem = {
            ...item,
            id: Math.random().toString(36).substring(7),
            timestamp: Date.now(),
        };

        setHistory((prev) => {
            // Remove duplicates (same url, method, headers, body)
            const filtered = prev.filter(
                (h) =>
                    !(
                        h.url === item.url &&
                        h.method === item.method &&
                        h.headers === item.headers &&
                        h.body === item.body
                    )
            );
            // Keep only the last 20 items
            return [newItem, ...filtered].slice(0, 20);
        });
    };

    const applyHistory = (item: HistoryItem) => {
        setUrl(item.url);
        setMethod(item.method);
        setHeaders(item.headers);
        setBody(item.body);
        toast.info('Request config applied from history');
    };

    const clearHistory = () => {
        setHistory([]);
        localStorage.removeItem('api_tester_history');
        toast.success('History cleared');
    };

    const [response, setResponse] = useState<any>(null);
    const [responseMeta, setResponseMeta] = useState<{ status: number; statusText: string; time: number } | null>(null);
    const [isLoadingRequest, setIsLoadingRequest] = useState(false);

    // HTML Viewer States
    const [htmlInput, setHtmlInput] = useState('<div class="p-4 bg-muted rounded-lg">\n  <h2 class="text-xl font-bold text-primary mb-2">Hello World!</h2>\n  <p class="text-muted-foreground">This is a live preview of your HTML.</p>\n  <button class="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90">Click Me</button>\n</div>');
    const [htmlPreview, setHtmlPreview] = useState(htmlInput);

    const handleSendRequest = async () => {
        if (!url) {
            toast.error('URL is required');
            return;
        }

        let parsedHeaders = {};
        let parsedBody = undefined;

        try {
            parsedHeaders = headers.trim() ? JSON.parse(headers) : {};
        } catch (e) {
            toast.error('Invalid JSON in Headers');
            return;
        }

        if (method !== 'GET') {
            try {
                parsedBody = body.trim() ? JSON.parse(body) : undefined;
            } catch (e) {
                toast.error('Invalid JSON in Body');
                return;
            }
        }

        setIsLoadingRequest(true);
        setResponse(null);
        setResponseMeta(null);

        const startTime = Date.now();

        try {
            const res = await axios({
                method,
                url,
                headers: parsedHeaders,
                data: parsedBody,
                // Do not throw on 4xx/5xx to capture the response for display
                validateStatus: () => true,
            });

            const endTime = Date.now();
            setResponse(res.data);
            setResponseMeta({
                status: res.status,
                statusText: res.statusText,
                time: endTime - startTime,
            });

            // Add to history
            addToHistory({ url, method, headers, body });
        } catch (error) {
            const err = error as AxiosError;
            toast.error('Request failed. Check console or network tab.');
            setResponse(err.message || 'Network Error / CORS Issue');
            setResponseMeta({
                status: 0,
                statusText: 'Error',
                time: Date.now() - startTime,
            });
        } finally {
            setIsLoadingRequest(false);
        }
    };

    const getStatusColor = (status: number) => {
        if (status >= 200 && status < 300) return 'text-green-500';
        if (status >= 300 && status < 400) return 'text-blue-500';
        if (status >= 400 && status < 500) return 'text-yellow-500';
        if (status >= 500) return 'text-red-500';
        return 'text-muted-foreground';
    };

    return (
        <CMSLayout breadcrumbs={[{ title: 'Dev Tools', href: route('dev.tools') }]}>
            <Head title="Dev Tools - API Tester & HTML Viewer" />

            <div className="space-y-6 max-w-7xl">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Development Tools</h1>
                    <p className="text-muted-foreground">
                        Internal utilities for debugging APIs and rendering HTML templates.
                    </p>
                </div>

                <Tabs defaultValue="api_tester" className="w-full">
                    <TabsList className="grid w-full max-w-md grid-cols-2">
                        <TabsTrigger value="api_tester" className="flex items-center gap-2">
                            <Activity className="h-4 w-4" />
                            API Tester
                        </TabsTrigger>
                        <TabsTrigger value="html_viewer" className="flex items-center gap-2">
                            <Code className="h-4 w-4" />
                            HTML Viewer
                        </TabsTrigger>
                    </TabsList>

                    {/* --- API TESTER TAB --- */}
                    <TabsContent value="api_tester" className="mt-6 flex flex-col lg:flex-row gap-6">
                        <Card className="flex-1">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                                <div className="space-y-1">
                                    <CardTitle>Request Config</CardTitle>
                                    <CardDescription>Configure and send HTTP requests.</CardDescription>
                                </div>
                                {history.length > 0 && (
                                    <div className="flex items-center gap-2">
                                        <Select onValueChange={(val) => {
                                            const item = history.find(h => h.id === val);
                                            if (item) applyHistory(item);
                                        }}>
                                            <SelectTrigger className="w-[180px] h-8 text-xs">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-3 w-3" />
                                                    <span>History</span>
                                                </div>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {history.map((item) => (
                                                    <SelectItem key={item.id} value={item.id} className="text-xs">
                                                        <div className="flex flex-col gap-0.5 max-w-[200px]">
                                                            <span className="font-bold uppercase text-[10px] text-primary">{item.method}</span>
                                                            <span className="truncate">{item.url}</span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                                <div className="border-t mt-1 p-1">
                                                    <Button variant="ghost" size="sm" className="w-full h-7 text-[10px] justify-start text-destructive hover:text-destructive" onClick={(e) => {
                                                        e.stopPropagation();
                                                        clearHistory();
                                                    }}>
                                                        <Trash2 className="h-3 w-3 mr-2" />
                                                        Clear History
                                                    </Button>
                                                </div>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex gap-2">
                                    <div className="w-[120px]">
                                        <Select
                                            value={method}
                                            onValueChange={(val) => setMethod(val as HttpMethod)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Method" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="GET">GET</SelectItem>
                                                <SelectItem value="POST">POST</SelectItem>
                                                <SelectItem value="PUT">PUT</SelectItem>
                                                <SelectItem value="PATCH">PATCH</SelectItem>
                                                <SelectItem value="DELETE">DELETE</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Input
                                        placeholder="https://api.example.com/v1/users"
                                        value={url}
                                        onChange={(e) => setUrl(e.target.value)}
                                        className="flex-1"
                                    />
                                    <Button onClick={handleSendRequest} disabled={isLoadingRequest}>
                                        {isLoadingRequest ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Send className="h-4 w-4 mr-2" />
                                        )}
                                        {isLoadingRequest ? 'Sending...' : 'Send'}
                                    </Button>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="headers">Headers (JSON)</Label>
                                    <Textarea
                                        id="headers"
                                        className="font-mono text-sm min-h-[120px]"
                                        value={headers}
                                        onChange={(e) => setHeaders(e.target.value)}
                                    />
                                </div>

                                {method !== 'GET' && (
                                    <div className="space-y-2 relative">
                                        <Label htmlFor="body">Body (JSON)</Label>
                                        <Textarea
                                            id="body"
                                            className="font-mono text-sm min-h-[200px]"
                                            value={body}
                                            onChange={(e) => setBody(e.target.value)}
                                        />
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="flex-1 flex flex-col h-full lg:min-h-[600px] max-w-[80vh]]">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <div className="space-y-1">
                                    <CardTitle>Response</CardTitle>
                                    <CardDescription>View the output of your request.</CardDescription>
                                </div>
                                {responseMeta && (
                                    <div className="flex items-center gap-4 text-sm font-medium">
                                        <span className={getStatusColor(responseMeta.status)}>
                                            Status: {responseMeta.status} {responseMeta.statusText}
                                        </span>
                                        <span className="text-muted-foreground">
                                            Time: {responseMeta.time}ms
                                        </span>
                                    </div>
                                )}
                            </CardHeader>
                            <CardContent className="flex-1 overflow-auto bg-muted/30 m-4 mt-0 rounded-md border p-0 relative min-h-[200px]">
                                {isLoadingRequest ? (
                                    <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
                                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                    </div>
                                ) : !response && !responseMeta ? (
                                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                                        No request sent yet.
                                    </div>
                                ) : (
                                    <pre className="p-4 text-xs font-mono overflow-auto h-full max-h-[600px] whitespace-pre-wrap word-break max-w-[80vh]">
                                        {typeof response === 'object'
                                            ? JSON.stringify(response, null, 2)
                                            : response}
                                    </pre>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* --- HTML VIEWER TAB --- */}
                    <TabsContent value="html_viewer" className="mt-6 flex flex-col lg:flex-row gap-6">
                        <Card className="flex-1">
                            <CardHeader>
                                <CardTitle>Raw HTML Input</CardTitle>
                                <CardDescription>Write or paste your HTML strings here.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Textarea
                                    className="font-mono text-sm min-h-[400px]"
                                    value={htmlInput}
                                    onChange={(e) => setHtmlInput(e.target.value)}
                                    placeholder="<div><h1>Your HTML here...</h1></div>"
                                />
                                <Button
                                    className="w-full"
                                    onClick={() => setHtmlPreview(htmlInput)}
                                >
                                    <Code className="h-4 w-4 mr-2" />
                                    Preview Render
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="flex-1">
                            <CardHeader>
                                <CardTitle>Live Render</CardTitle>
                                <CardDescription>DOM output will be displayed below.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div
                                    className="border rounded-md min-h-[400px] p-4 bg-white text-black overflow-auto"
                                    dangerouslySetInnerHTML={{ __html: htmlPreview }}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>

                </Tabs>
            </div>
        </CMSLayout>
    );
}
