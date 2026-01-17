import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Video, 
  Download, 
  Play, 
  Eye, 
  BookOpen, 
  Image, 
  FileSpreadsheet,
  Presentation,
  File,
  Clock,
  User,
  Search,
  Filter,
  ChevronDown,
  ExternalLink,
  Loader
} from 'lucide-react';
import { materialAPI, enrollmentAPI } from '../services/api';

const CourseMaterials = ({ selectedCourse, onBack }) => {
  const [materials, setMaterials] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCourse, setFilterCourse] = useState('all');
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [downloading, setDownloading] = useState({});

  useEffect(() => {
    fetchMaterials();
  }, [selectedCourse]);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      
      if (selectedCourse) {
        // Fetch materials for specific course
        const response = await materialAPI.getCourseMaterials(selectedCourse._id);
        setMaterials(response.data.materials || []);
        setAllCourses([selectedCourse]);
      } else {
        // First get all enrolled courses
        const coursesResponse = await enrollmentAPI.getMyCourses();
        const enrolledCourses = coursesResponse.data.courses || [];
        setAllCourses(enrolledCourses);
        
        // Then fetch materials for each course
        const allMaterials = [];
        
        for (const course of enrolledCourses) {
          try {
            const materialsResponse = await materialAPI.getCourseMaterials(course._id);
            const courseMaterials = materialsResponse.data.materials || [];
            
            courseMaterials.forEach(material => {
              allMaterials.push({ 
                ...material, 
                courseName: course.title, 
                courseId: course._id 
              });
            });
          } catch (error) {
            console.error(`Error fetching materials for course ${course.title}:`, error);
          }
        }
        
        setMaterials(allMaterials);
      }
    } catch (error) {
      console.error('Error fetching materials:', error);
      setMaterials([]);
      setAllCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (fileType, type) => {
    if (type === 'video' || fileType?.startsWith('video/')) {
      return <Video className="h-5 w-5 text-red-500" />;
    }
    if (fileType?.includes('pdf')) {
      return <FileText className="h-5 w-5 text-red-600" />;
    }
    if (fileType?.startsWith('image/')) {
      return <Image className="h-5 w-5 text-green-500" />;
    }
    if (fileType?.includes('sheet') || fileType?.includes('excel')) {
      return <FileSpreadsheet className="h-5 w-5 text-green-600" />;
    }
    if (fileType?.includes('presentation') || fileType?.includes('powerpoint')) {
      return <Presentation className="h-5 w-5 text-orange-500" />;
    }
    return <File className="h-5 w-5 text-gray-500" />;
  };

  const getFileTypeLabel = (fileType, type) => {
    if (type === 'video') return 'Video';
    if (fileType?.includes('pdf')) return 'PDF';
    if (fileType?.startsWith('image/')) return 'Image';
    if (fileType?.includes('sheet') || fileType?.includes('excel')) return 'Excel';
    if (fileType?.includes('presentation') || fileType?.includes('powerpoint')) return 'PowerPoint';
    if (fileType?.includes('word')) return 'Word';
    return 'File';
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleDownload = async (material) => {
    try {
      setDownloading(prev => ({ ...prev, [material._id]: true }));
      
      // Check if it's a YouTube video
      if (isYouTubeVideo(material)) {
        // Open YouTube video in new tab (cannot download due to copyright)
        window.open(material.youtubeLink, '_blank');
        return;
      }
      
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = material.fileUrl;
      link.download = material.fileName || `${material.title}.${material.fileType?.split('/')[1] || 'file'}`;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      
      // For cross-origin files, fetch and create blob URL
      try {
        const response = await fetch(material.fileUrl);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        
        link.href = blobUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up blob URL
        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
      } catch (fetchError) {
        // Fallback to direct download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download file');
    } finally {
      setDownloading(prev => ({ ...prev, [material._id]: false }));
    }
  };

  const handleView = (material) => {
    setSelectedMaterial(material);
    setShowPreview(true);
  };

  const isYouTubeVideo = (material) => {
    return material.type === 'video' && material.youtubeLink;
  };

  const getYouTubeEmbedUrl = (url) => {
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return videoId ? `https://www.youtube.com/embed/${videoId[1]}` : url;
  };

  const filteredMaterials = () => {
    let allMaterials = materials;
    
    // If no selectedCourse, materials are already flat array
    // If selectedCourse, materials are already for that course
    if (!Array.isArray(allMaterials)) {
      allMaterials = [];
    }

    // Filter by course
    if (filterCourse !== 'all') {
      allMaterials = allMaterials.filter(material => 
        material.courseId === filterCourse || 
        (selectedCourse && selectedCourse._id === filterCourse)
      );
    }

    // Filter by search term
    if (searchTerm) {
      allMaterials = allMaterials.filter(material =>
        material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (material.courseName && material.courseName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (selectedCourse && selectedCourse.title.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by type
    if (filterType !== 'all') {
      allMaterials = allMaterials.filter(material => material.type === filterType);
    }

    return allMaterials;
  };

  const renderMaterialCard = (material) => (
    <div key={material._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300 h-80 flex flex-col">
      {/* Material Header */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex-1">
        <div className="flex items-start justify-between gap-3 h-full">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg flex-shrink-0">
              {getFileIcon(material.fileType, material.type)}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-tight mb-2 break-words">
                {material.title}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 break-words">
                {material.courseName || selectedCourse?.title || 'Course'}
              </p>
              {material.description && (
                <p className="text-xs text-gray-600 dark:text-gray-400 break-words">
                  {material.description}
                </p>
              )}
            </div>
          </div>
          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 text-xs rounded-full font-medium flex-shrink-0 h-fit">
            {getFileTypeLabel(material.fileType, material.type)}
          </span>
        </div>
      </div>

      {/* Material Info */}
      <div className="p-4 bg-gray-50 dark:bg-gray-700/50">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <User className="h-3 w-3 flex-shrink-0" />
              <span className="break-words">{material.instructor?.name || 'Instructor'}</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 flex-shrink-0" />
            <span className="break-words">{new Date(material.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        {material.fileSize && (
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-3 text-center">
            <span className="font-medium">{formatFileSize(material.fileSize)}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          {/* View/Play Button */}
          <button
            onClick={() => handleView(material)}
            className="flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-2 py-2 rounded-lg transition-colors text-xs font-medium"
          >
            <Eye className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="break-words text-center leading-tight">
              {isYouTubeVideo(material) ? 'Play' : 
               material.fileType?.startsWith('video/') ? 'Play' :
               material.fileType?.startsWith('image/') ? 'Preview' : 'View'}
            </span>
          </button>

          {/* Download Button */}
          <button
            onClick={() => handleDownload(material)}
            disabled={downloading[material._id]}
            className={`flex items-center justify-center gap-1 text-white px-2 py-2 rounded-lg transition-colors text-xs font-medium ${
              isYouTubeVideo(material) 
                ? 'bg-red-600 hover:bg-red-700 disabled:bg-gray-400' 
                : 'bg-green-600 hover:bg-green-700 disabled:bg-gray-400'
            }`}
          >
            {downloading[material._id] ? (
              <Loader className="h-3.5 w-3.5 animate-spin flex-shrink-0" />
            ) : isYouTubeVideo(material) ? (
              <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
            ) : (
              <Download className="h-3.5 w-3.5 flex-shrink-0" />
            )}
            <span className="break-words text-center leading-tight">
              {downloading[material._id] ? 'Loading' : 
               isYouTubeVideo(material) ? 'YouTube' : 'Download'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderPreviewModal = () => {
    if (!showPreview || !selectedMaterial) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Modal Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getFileIcon(selectedMaterial.fileType, selectedMaterial.type)}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{selectedMaterial.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedMaterial.courseName || selectedCourse?.title || 'Course'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowPreview(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              ✕
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-4 max-h-[calc(90vh-120px)] overflow-y-auto">
            {isYouTubeVideo(selectedMaterial) ? (
              <div className="aspect-video">
                <iframe
                  src={getYouTubeEmbedUrl(selectedMaterial.youtubeLink)}
                  className="w-full h-full rounded-lg"
                  allowFullScreen
                  title={selectedMaterial.title}
                />
              </div>
            ) : selectedMaterial.fileType?.startsWith('video/') ? (
              <div className="aspect-video">
                <video
                  src={selectedMaterial.fileUrl}
                  controls
                  className="w-full h-full rounded-lg"
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            ) : selectedMaterial.fileType?.includes('pdf') ? (
              <div className="h-96">
                <iframe
                  src={`https://docs.google.com/gview?url=${encodeURIComponent(selectedMaterial.fileUrl)}&embedded=true`}
                  className="w-full h-full rounded-lg border"
                  title={selectedMaterial.title}
                />
              </div>
            ) : selectedMaterial.fileType?.includes('word') || selectedMaterial.fileType?.includes('document') ? (
              <div className="h-96">
                <iframe
                  src={`https://docs.google.com/gview?url=${encodeURIComponent(selectedMaterial.fileUrl)}&embedded=true`}
                  className="w-full h-full rounded-lg border"
                  title={selectedMaterial.title}
                />
              </div>
            ) : selectedMaterial.fileType?.includes('presentation') || selectedMaterial.fileType?.includes('powerpoint') ? (
              <div className="h-96">
                <iframe
                  src={`https://docs.google.com/gview?url=${encodeURIComponent(selectedMaterial.fileUrl)}&embedded=true`}
                  className="w-full h-full rounded-lg border"
                  title={selectedMaterial.title}
                />
              </div>
            ) : selectedMaterial.fileType?.includes('sheet') || selectedMaterial.fileType?.includes('excel') ? (
              <div className="h-96">
                <iframe
                  src={`https://docs.google.com/gview?url=${encodeURIComponent(selectedMaterial.fileUrl)}&embedded=true`}
                  className="w-full h-full rounded-lg border"
                  title={selectedMaterial.title}
                />
              </div>
            ) : selectedMaterial.fileType?.startsWith('image/') ? (
              <div className="text-center">
                <img
                  src={selectedMaterial.fileUrl}
                  alt={selectedMaterial.title}
                  className="max-w-full max-h-96 mx-auto rounded-lg"
                />
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  {getFileIcon(selectedMaterial.fileType, selectedMaterial.type)}
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Preview not available for this file type
                </p>
                <button
                  onClick={() => handleDownload(selectedMaterial)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 mx-auto"
                >
                  <Download className="h-4 w-4" />
                  Download File
                </button>
              </div>
            )}

            {/* Material Details */}
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Instructor:</span>
                  <span className="ml-2 text-gray-600 dark:text-gray-400">{selectedMaterial.instructor?.name}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Uploaded:</span>
                  <span className="ml-2 text-gray-600 dark:text-gray-400">{new Date(selectedMaterial.createdAt).toLocaleDateString()}</span>
                </div>
                {selectedMaterial.fileSize && (
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Size:</span>
                    <span className="ml-2 text-gray-600 dark:text-gray-400">{formatFileSize(selectedMaterial.fileSize)}</span>
                  </div>
                )}
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Type:</span>
                  <span className="ml-2 text-gray-600 dark:text-gray-400">{getFileTypeLabel(selectedMaterial.fileType, selectedMaterial.type)}</span>
                </div>
              </div>
              {selectedMaterial.description && (
                <div className="mt-3">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Description:</span>
                  <p className="mt-1 text-gray-600 dark:text-gray-400">{selectedMaterial.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors self-start"
        >
          ← Back to Courses
        </button>
        <div className="flex items-center gap-3 flex-1">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex-shrink-0">
            <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white leading-tight">
              {selectedCourse ? selectedCourse.title : 'Course Materials'}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {selectedCourse ? 'Course materials and resources' : 'Access all your course resources'}
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-700">
          <div className="space-y-3 sm:space-y-0 sm:flex sm:gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search materials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
              />
            </div>
            
            <div className="flex gap-2 sm:gap-3">
              {!selectedCourse && (
                <div className="relative flex-1 sm:flex-none">
                  <select
                    value={filterCourse}
                    onChange={(e) => setFilterCourse(e.target.value)}
                    className="appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 pr-8 focus:ring-2 focus:ring-blue-500 dark:text-white w-full sm:min-w-[140px] text-sm"
                  >
                    <option value="all">All Courses</option>
                    {allCourses.map((course) => (
                      <option key={course._id} value={course._id}>
                        {course.title.length > 20 ? `${course.title.substring(0, 20)}...` : course.title}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              )}
              
              <div className="relative flex-1 sm:flex-none">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 pr-8 focus:ring-2 focus:ring-blue-500 dark:text-white w-full sm:min-w-[110px] text-sm"
                >
                  <option value="all">All Types</option>
                  <option value="video">Videos</option>
                  <option value="file">Documents</option>
                  <option value="lecture_note">Notes</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
      </div>

      {/* Materials Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredMaterials().length === 0 ? (
        <div className="text-center py-8 sm:py-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 sm:p-6">
          <BookOpen className="h-12 sm:h-16 w-12 sm:w-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
          <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2">
            {searchTerm || filterType !== 'all' || filterCourse !== 'all'
              ? 'No Materials Found' 
              : 'No Materials Available'}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 px-4">
            {searchTerm || filterType !== 'all' || filterCourse !== 'all'
              ? 'Try adjusting your search or filter criteria.' 
              : 'No materials have been uploaded for your courses yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredMaterials().map(renderMaterialCard)}
        </div>
      )}

      {/* Preview Modal */}
      {renderPreviewModal()}
    </div>
  );
};

export default CourseMaterials;