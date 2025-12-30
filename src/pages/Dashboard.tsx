import { useAuth } from "@/hooks/use-auth";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, MapPin, ShieldAlert, ShieldCheck, Upload, AlertTriangle, CheckCircle2, Image as ImageIcon, Newspaper, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function Dashboard() {
  const { user } = useAuth();
  const updateLocation = useMutation(api.users.updateLocation);
  const [locationRequested, setLocationRequested] = useState(false);

  useEffect(() => {
    if (user && !user.location && !locationRequested) {
      setLocationRequested(true);
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              await updateLocation({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                displayName: "Current Location",
              });
              toast.success("Location updated successfully");
            } catch (error) {
              console.error("Failed to update location", error);
              toast.error("Failed to save location");
            }
          },
          (error) => {
            console.error("Error getting location", error);
            toast.error("Could not access location. Some features may be limited.");
          }
        );
      }
    }
  }, [user, locationRequested, updateLocation]);

  return (
    <div className="min-h-screen bg-background p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex justify-between items-center border-b pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Veritas Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Verify news and analyze images with advanced detection.
            </p>
          </div>
          <div className="flex items-center gap-4">
            {user?.location && (
              <Badge variant="outline" className="gap-2 py-1.5">
                <MapPin className="h-3 w-3" />
                Location Active
              </Badge>
            )}
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
          </div>
        </header>

        <Tabs defaultValue="news" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
            <TabsTrigger value="news" className="gap-2">
              <Newspaper className="h-4 w-4" />
              News Verification
            </TabsTrigger>
            <TabsTrigger value="images" className="gap-2">
              <ImageIcon className="h-4 w-4" />
              Image Analysis
            </TabsTrigger>
          </TabsList>

          <TabsContent value="news" className="space-y-6">
            <NewsChecker />
          </TabsContent>

          <TabsContent value="images" className="space-y-6">
            <ImageChecker />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function NewsChecker() {
  const checkNews = useAction(api.news_actions.checkNews);
  const clearHistory = useMutation(api.news.clearHistory);
  const history = useQuery(api.news.getHistory);
  const [content, setContent] = useState("");
  const [isChecking, setIsChecking] = useState(false);

  const handleCheck = async () => {
    if (!content.trim()) return;
    
    setIsChecking(true);
    try {
      const isUrl = content.startsWith("http");
      await checkNews({
        content,
        type: isUrl ? "url" : "text",
      });
      toast.success("Verification complete");
      setContent("");
    } catch (error) {
      console.error(error);
      toast.error("Failed to verify news");
    } finally {
      setIsChecking(false);
    }
  };

  const handleClearHistory = async () => {
    try {
      await clearHistory();
      toast.success("History cleared");
    } catch (error) {
      toast.error("Failed to clear history");
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Verify News</CardTitle>
          <CardDescription>
            Enter a news article URL or paste the text content to cross-check with reliable sources.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Paste news text or URL here..."
            className="min-h-[150px] resize-none"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <Button 
            className="w-full bg-primary hover:bg-primary/90 text-white" 
            onClick={handleCheck}
            disabled={isChecking || !content}
          >
            {isChecking ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying with Major Networks...
              </>
            ) : (
              "Check Credibility"
            )}
          </Button>
        </CardContent>
      </Card>

      <Card className="h-full flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle>Recent Checks</CardTitle>
            <CardDescription>Your verification history</CardDescription>
          </div>
          {history && history.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={handleClearHistory}
              title="Clear History"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </CardHeader>
        <CardContent className="flex-1 pt-4">
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {history?.map((item) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-sm font-medium line-clamp-2 flex-1">
                      {item.content}
                    </p>
                    <Badge 
                      variant={item.result === "fake" ? "destructive" : "default"}
                      className={item.result === "real" ? "bg-green-600 hover:bg-green-700" : ""}
                    >
                      {item.result.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="bg-muted/50 p-3 rounded text-xs text-muted-foreground whitespace-pre-wrap font-mono">
                    {item.analysis}
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Confidence: {item.confidence}%</span>
                    <div className="flex gap-1">
                      {item.sources.slice(0, 2).map((source, i) => (
                        <span key={i} className="bg-background border px-1.5 py-0.5 rounded">
                          {source}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
              {history?.length === 0 && (
                <div className="text-center text-muted-foreground py-12">
                  No checks yet. Try verifying some news!
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

function ImageChecker() {
  const generateUploadUrl = useMutation(api.images.generateUploadUrl);
  const analyzeImage = useAction(api.images.analyzeImage);
  const history = useQuery(api.images.getHistory);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // 1. Get upload URL
      const postUrl = await generateUploadUrl();
      
      // 2. Upload file
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await result.json();

      // 3. Analyze
      await analyzeImage({ storageId });
      toast.success("Image analysis complete");
    } catch (error) {
      console.error(error);
      toast.error("Failed to analyze image");
    } finally {
      setIsUploading(false);
      // Reset input
      e.target.value = "";
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Analyze Image</CardTitle>
          <CardDescription>
            Upload an image to detect morphing, deepfakes, and AI generation artifacts.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="border-2 border-dashed rounded-lg p-12 text-center hover:bg-muted/50 transition-colors relative">
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleUpload}
              disabled={isUploading}
            />
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 rounded-full bg-primary/10 text-primary">
                {isUploading ? (
                  <Loader2 className="h-8 w-8 animate-spin" />
                ) : (
                  <Upload className="h-8 w-8" />
                )}
              </div>
              <div>
                <p className="font-medium">Click or drag to upload</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Supports JPG, PNG, WEBP
                </p>
              </div>
            </div>
          </div>

          <Alert>
            <ShieldAlert className="h-4 w-4" />
            <AlertTitle>How it works</AlertTitle>
            <AlertDescription>
              Our system analyzes pixel-level inconsistencies, lighting gradients, and compression artifacts to detect manipulation.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle>Analysis Results</CardTitle>
          <CardDescription>Recent image scans</CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {history?.map((item) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border rounded-lg overflow-hidden"
                >
                  <div className="flex gap-4 p-4">
                    {item.url && (
                      <div className="h-20 w-20 shrink-0 rounded bg-muted overflow-hidden">
                        <img 
                          src={item.url} 
                          alt="Analyzed" 
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Morphed Probability
                        </span>
                        <Badge 
                          variant={item.isMorphed ? "destructive" : "outline"}
                          className={!item.isMorphed ? "bg-green-600 text-white hover:bg-green-700 border-transparent" : ""}
                        >
                          {item.probability}%
                        </Badge>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all ${item.isMorphed ? 'bg-destructive' : 'bg-green-500'}`}
                          style={{ width: `${item.probability}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground whitespace-pre-wrap font-mono mt-2">
                        {item.analysis}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
              {history?.length === 0 && (
                <div className="text-center text-muted-foreground py-12">
                  No images analyzed yet.
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}