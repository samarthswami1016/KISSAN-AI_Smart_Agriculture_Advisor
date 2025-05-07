import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Camera, Upload, Loader2, Leaf, AlertTriangle, CheckCircle, Sprout } from 'lucide-react';

interface Disease {
  name: string;
  probability: number;
  description?: string;
  treatment?: string;
}

interface PlantIdResponse {
  result: {
    is_plant: boolean;
    health_assessment: {
      is_healthy: boolean;
      diseases: Disease[];
    };
    classification: {
      suggestions: Array<{
        name: string;
        probability: number;
      }>;
    };
  };
}

const CropHealthTab = () => {
  const { t } = useTranslation();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<PlantIdResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeImage = async (file: File) => {
    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const base64Image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const base64Data = base64Image.split(',')[1];

      const response = await fetch('https://api.plant.id/v2/health_assessment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Api-Key': import.meta.env.VITE_PLANTID_API_KEY,
        },
        body: JSON.stringify({
          images: [base64Data],
          modifiers: ["crops_fast", "similar_images"],
          language: "en",
          details: ["description", "treatment", "classification", "common_names"],
        }),
      });

      if (!response.ok) {
        throw new Error(`${t('cropHealth.apiError')} (${response.status})`);
      }

      const data = await response.json();

      // Validate response structure
      if (!data || !data.health_assessment || !data.health_assessment.diseases) {
        throw new Error(t('cropHealth.invalidResponseFormat'));
      }

      // Transform the API response to match our expected format
      const transformedData: PlantIdResponse = {
        result: {
          is_plant: true,
          health_assessment: {
            is_healthy: data.health_assessment.is_healthy || false,
            diseases: data.health_assessment.diseases.map((disease: any) => ({
              name: disease.name || 'Unknown Disease',
              probability: disease.probability || 0,
              description: disease.description?.value || '',
              treatment: disease.treatment?.value || ''
            }))
          },
          classification: {
            suggestions: data.classification?.suggestions || []
          }
        }
      };

      setAnalysis(transformedData);
    } catch (err) {
      console.error('Error analyzing image:', err);
      setError(err instanceof Error ? err.message : t('cropHealth.analysisError'));
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset previous state
    setSelectedImage(null);
    setSelectedFile(null);
    setAnalysis(null);
    setError(null);

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setError(t('cropHealth.fileSizeError'));
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError(t('cropHealth.fileTypeError'));
      return;
    }

    // Create object URL for preview
    const imageUrl = URL.createObjectURL(file);
    setSelectedImage(imageUrl);
    setSelectedFile(file);

    // Start analysis
    await analyzeImage(file);
  };

  const renderAnalysisResults = () => {
    if (!analysis?.result) return null;

    const { health_assessment, classification } = analysis.result;

    return (
      <div className="space-y-6">
        <div className="p-6 bg-gray-800/50 rounded-xl border border-gray-700/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">{t('cropHealth.healthStatus')}</h3>
            {health_assessment.is_healthy ? (
              <div className="flex items-center text-green-500">
                <CheckCircle className="h-5 w-5 mr-2" />
                <span>{t('cropHealth.healthy')}</span>
              </div>
            ) : (
              <div className="flex items-center text-yellow-500">
                <AlertTriangle className="h-5 w-5 mr-2" />
                <span>{t('cropHealth.issues')}</span>
              </div>
            )}
          </div>

          {classification?.suggestions?.length > 0 && (
            <div className="mb-4 p-4 bg-gray-900/50 rounded-lg">
              <p className="text-gray-400 mb-2">{t('cropHealth.identified')}</p>
              <p className="text-lg font-medium">
                {classification.suggestions[0].name}
                <span className="text-sm text-gray-400 ml-2">
                  ({Math.round(classification.suggestions[0].probability * 100)}% {t('cropHealth.confidence')})
                </span>
              </p>
            </div>
          )}

          {health_assessment.diseases?.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-medium text-yellow-500">{t('cropHealth.detectedIssues')}</h4>
              {health_assessment.diseases.map((disease, index) => (
                <div key={index} className="p-4 bg-gray-900/50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{disease.name}</span>
                    <span className="text-yellow-500">
                      {Math.round(disease.probability * 100)}% {t('cropHealth.probability')}
                    </span>
                  </div>
                  {disease.description && (
                    <p className="text-gray-400 text-sm mb-2">{disease.description}</p>
                  )}
                  {disease.treatment && (
                    <div className="mt-2 p-2 bg-green-900/20 border border-green-500/20 rounded">
                      <p className="text-sm text-green-400">
                        {t('cropHealth.treatment')}: {disease.treatment}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 bg-gray-800/50 rounded-xl border border-gray-700/50">
          <h3 className="text-lg font-semibold mb-4">{t('cropHealth.recommendations')}</h3>
          <ul className="space-y-3 text-gray-300">
            {health_assessment.is_healthy ? (
              <>
                {t('cropHealth.healthyRecommendations', { returnObjects: true }).map((rec, index) => (
                  <li key={index} className="flex items-start">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-2 mr-2"></div>
                    <span>{rec}</span>
                  </li>
                ))}
              </>
            ) : (
              <>
                {t('cropHealth.unhealthyRecommendations', { returnObjects: true }).map((rec, index) => (
                  <li key={index} className="flex items-start">
                    <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2 mr-2"></div>
                    <span>{rec}</span>
                  </li>
                ))}
              </>
            )}
          </ul>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 px-4">
      <div className="relative bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-8 overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-2xl font-bold mb-4">{t('cropHealth.title')}</h1>
          <p className="text-gray-400">{t('cropHealth.subtitle')}</p>
        </div>
        <div className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4">
          <Sprout className="h-32 w-32 text-green-500/10" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-8">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-green-500/10 rounded-lg mr-3">
              <Camera className="h-6 w-6 text-green-500" />
            </div>
            <h2 className="text-xl font-semibold">{t('cropHealth.upload')}</h2>
          </div>
          
          <div className="mt-4">
            <label className="block w-full">
              <div className="relative">
                <input
                  type="file"
                  className="hidden"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                />
                <div className="h-64 border-2 border-dashed border-green-500/50 rounded-lg flex items-center justify-center cursor-pointer hover:border-green-400 transition-colors duration-200 bg-gray-800/50">
                  {selectedImage ? (
                    <img
                      src={selectedImage}
                      alt={t('cropHealth.selectedImage')}
                      className="h-full w-full object-contain rounded-lg p-2"
                    />
                  ) : (
                    <div className="text-center p-6">
                      <Upload className="h-12 w-12 text-green-500/70 mx-auto mb-2" />
                      <p className="text-sm text-gray-400">
                        {t('cropHealth.uploadInstructions')}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {t('cropHealth.supportedFormats')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </label>
          </div>

          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-semibold">{t('cropHealth.tips')}</h3>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-center">
                <Leaf className="h-4 w-4 mr-2 text-green-500" />
                {t('cropHealth.tip1')}
              </li>
              <li className="flex items-center">
                <Leaf className="h-4 w-4 mr-2 text-green-500" />
                {t('cropHealth.tip2')}
              </li>
              <li className="flex items-center">
                <Leaf className="h-4 w-4 mr-2 text-green-500" />
                {t('cropHealth.tip3')}
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-8">
          <h2 className="text-xl font-semibold mb-6">{t('cropHealth.analysisResults')}</h2>
          
          {loading && (
            <div className="flex flex-col items-center justify-center h-64">
              <Loader2 className="h-8 w-8 text-green-500 animate-spin mb-4" />
              <p className="text-gray-400">{t('cropHealth.analyzing')}</p>
            </div>
          )}

          {error && (
            <div className="p-6 bg-red-900/20 border border-red-500/50 rounded-xl">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {!loading && !error && analysis ? (
            renderAnalysisResults()
          ) : (
            !loading && !error && (
              <div className="h-64 flex items-center justify-center">
                <p className="text-gray-400 text-center">
                  {t('cropHealth.uploadPrompt')}
                </p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default CropHealthTab;