import React, { useState, useEffect, useRef } from "react";
import { Download, FileText, Star, TrendingUp, Loader2, Sparkles, ChevronRight } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { farmerApi } from "../../utils/api";
import { getDummyReports, getDummyReportsSummary } from "../../utils/dummyData";

function getGradeColor(score) {
    if (score >= 90) return "text-emerald-600";
    if (score >= 80) return "text-amber-500";
    return "text-orange-500";
}

function getBgColor(score) {
    if (score >= 90) return "bg-emerald-500/10";
    if (score >= 80) return "bg-amber-500/10";
    return "bg-orange-500/10";
}

export default function Reports() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({ reports: [], summary: {} });
    const [selectedReport, setSelectedReport] = useState(null);
    const [showDetails, setShowDetails] = useState(false);
    
    // Ref to store AbortController
    const abortController = useRef();

    useEffect(() => {
        if (user?.email) {
            fetchReports();
        }
        
        // Cleanup function to abort pending requests and reset state
        return () => {
            if (abortController.current) {
                abortController.current.abort();
            }
            // Clean up modal state to prevent DOM issues
            setShowDetails(false);
            setSelectedReport(null);
        };
    }, [user?.email]);

    const handleViewDetails = (report) => {
        console.log('Viewing report details:', report);
        setSelectedReport(report);
        setShowDetails(true);
    };

    const closeModal = () => {
        // Add defensive programming to prevent DOM errors
        try {
            setShowDetails(false);
            setSelectedReport(null);
        } catch (error) {
            console.error('Error closing modal:', error);
            // Force cleanup even if there's an error
            setShowDetails(false);
            setSelectedReport(null);
        }
    };

    const fetchReports = async () => {
        try {
            setLoading(true);
            const response = await farmerApi.getReports(user.email);
            if (response.data.success && response.data.reports) {
                // Log the structure to debug
                console.log('API Response:', response.data);
                // Filter out any reports that might have invalid data structure
                const validReports = response.data.reports.filter(report => {
                    return report && typeof report === 'object' && 
                           report.crop && report.grade && report.score && 
                           typeof report.score === 'number';
                });
                setData({
                    reports: validReports,
                    summary: response.data.summary || {}
                });
            } else {
                // Use dummy data if API response is invalid
                throw new Error('Invalid API response');
            }
        } catch (error) {
            console.error("Error fetching reports:", error);
            // Use dummy data as fallback
            const dummyReports = getDummyReports();
            const dummySummary = getDummyReportsSummary();
            console.log('Using dummy data:', { dummyReports, dummySummary });
            setData({
                reports: dummyReports,
                summary: dummySummary
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
                <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
                <p className="text-xs text-slate-400 uppercase tracking-widest animate-pulse">Loading reports...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 sm:space-y-8 pb-12 sm:pb-20 animate-in fade-in duration-500">
            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    body { background: white; }
                    .print-container { box-shadow: none !important; border: none !important; }
                }
            `}</style>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 sm:gap-6">
                <div className="space-y-1">
                    <h1 className="text-xl sm:text-2xl text-slate-900 tracking-tight">Quality Reports</h1>
                    <p className="text-sm text-slate-500">View quality assessments and grading history for your crops.</p>
                </div>
                <button onClick={() => window.print()} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 sm:px-6 py-2.5 sm:py-3 text-sm text-white transition-all hover:bg-emerald-700 shadow-lg shadow-emerald-600/15 active:scale-95 no-print">
                    <Download className="h-4 w-4" />
                    <span className="hidden sm:inline">Download PDF</span>
                </button>
            </div>

            {/* Summary Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="rounded-2xl border border-slate-100 bg-white p-4 sm:p-6 flex items-center gap-4 sm:gap-5 shadow-sm group hover:border-emerald-200 transition-all">
                    <div className="flex h-12 sm:h-14 w-12 sm:w-14 items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-100 group-hover:scale-105 transition-transform">
                        <Star className="h-6 w-6 sm:h-7 sm:w-7 text-emerald-600" />
                    </div>
                    <div className="text-center">
                        <p className="text-xl sm:text-2xl text-slate-900 font-bold">{data.summary.avgGrade || 'N/A'}</p>
                        <p className="text-xs text-slate-400 mt-0.5 sm:mt-1">Average Grade</p>
                    </div>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-white p-4 sm:p-6 flex items-center gap-4 sm:gap-5 shadow-sm group hover:border-emerald-200 transition-all">
                    <div className="flex h-12 sm:h-14 w-12 sm:w-14 items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-100 group-hover:scale-105 transition-transform">
                        <TrendingUp className="h-6 w-6 sm:h-7 sm:w-7 text-emerald-600" />
                    </div>
                    <div className="text-center">
                        <p className="text-xl sm:text-2xl text-slate-900 font-bold">{data.summary.avgScore || 0}</p>
                        <p className="text-xs text-slate-400 mt-0.5 sm:mt-1">Quality Score</p>
                    </div>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-white p-4 sm:p-6 flex items-center gap-4 sm:gap-5 shadow-sm group hover:border-emerald-200 transition-all">
                    <div className="flex h-12 sm:h-14 w-12 sm:w-14 items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-100 group-hover:scale-105 transition-transform">
                        <FileText className="h-6 w-6 sm:h-7 sm:w-7 text-emerald-600" />
                    </div>
                    <div className="text-center">
                        <p className="text-xl sm:text-2xl text-slate-900 font-bold">{data.summary.totalAnalyzed || 0}</p>
                        <p className="text-xs text-slate-400 mt-0.5 sm:mt-1">Crops Analyzed</p>
                    </div>
                </div>
            </div>

            {/* Quality History */}
            <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden shadow-sm print-container">
                <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-100 bg-slate-50/30 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-sm text-slate-900 font-medium">Quality History</h2>
                        <p className="text-xs text-slate-400 mt-0.5 sm:mt-1">Detailed records of your crop quality assessments.</p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-slate-100 shadow-sm">
                        <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
                        <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">AI Verified</span>
                    </div>
                </div>

                {data.reports.length > 0 ? (
                    <>
                        {/* Desktop */}
                        <div className="hidden md:block overflow-x-auto">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-6">
                                {data.reports.map((report) => (
                                    <div key={report.id} className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-all cursor-pointer print:break-inside-avoid"
                                        onClick={() => handleViewDetails(report)}>
                                        <div className="flex items-start justify-between gap-4 mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg ${getGradeColor(report.score)}`}>
                                                        {report.grade}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-slate-900">{report.crop}</h3>
                                                        <p className="text-sm text-slate-500">{report.variety} • {report.date}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <ChevronRight className="h-5 w-5 text-slate-400" />
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <span className="text-slate-400">Quality Score:</span>
                                                    <span className={`text-2xl font-bold ${getGradeColor(report.score)}`}>{report.score}/100</span>
                                                </div>

                                                <div className="flex items-center gap-2 text-sm">
                                                    <span className="text-slate-400">Type:</span>
                                                    <span className="text-slate-700 font-medium capitalize">{report.type === 'ai_analysis' ? 'AI Analysis' : 'Manual Inspection'}</span>
                                                </div>

                                                <div className="space-y-3">
                                                    <h4 className="text-sm font-semibold text-slate-800 mb-2">Key Metrics</h4>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        {Object.entries(report.details || {}).map(([key, value]) => (
                                                            <div key={key} className="flex justify-between items-center bg-slate-50 rounded-lg p-3 border border-slate-100">
                                                                <span className="text-xs text-slate-400 capitalize">{key.replace(/_/g, ' ')}</span>
                                                                <span className="text-sm text-slate-700 font-medium">{value}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Mobile */}
                        <div className="md:hidden divide-y divide-slate-100">
                            {data.reports.map((report) => (
                                <div key={report.id} className="p-4 space-y-4 print:break-inside-avoid">
                                    <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white font-bold text-lg ${getGradeColor(report.score)}`}>
                                                    {report.grade}
                                                </div>
                                                <div>
                                                    <h3 className="text-base sm:text-lg font-semibold text-slate-900">{report.crop}</h3>
                                                    <p className="text-xs sm:text-sm text-slate-500">{report.variety} • {report.date}</p>
                                                </div>
                                            </div>
                                            <ChevronRight className="h-5 w-5 text-slate-400" />
                                        </div>

                                        <div className="space-y-3 sm:space-y-4">
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="text-slate-400">Quality Score:</span>
                                                <span className={`text-xl sm:text-2xl font-bold ${getGradeColor(report.score)}`}>{report.score}/100</span>
                                            </div>

                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="text-slate-400">Type:</span>
                                                <span className="text-slate-700 font-medium capitalize">{report.type === 'ai_analysis' ? 'AI Analysis' : 'Manual Inspection'}</span>
                                            </div>

                                            <div className="space-y-2 sm:space-y-3">
                                                <h4 className="text-sm font-semibold text-slate-800 mb-2">Key Metrics</h4>
                                                <div className="grid grid-cols-1 gap-3">
                                                    {Object.entries(report.details || {}).map(([key, value]) => (
                                                        <div key={key} className="flex justify-between items-center bg-slate-50 rounded-lg p-2 sm:p-3 border border-slate-100">
                                                                    <span className="text-xs text-slate-400 capitalize">{key.replace(/_/g, ' ')}</span>
                                                                    <span className="text-sm text-slate-700 font-medium">{value}</span>
                                                                </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                ))}
                        </div>
                    </>
                ) : (
                    <div className="text-center py-16 sm:py-20 px-6 sm:px-8">
                        <div className="w-12 sm:w-16 h-12 sm:h-16 bg-slate-50 rounded-xl flex items-center justify-center mx-auto mb-4 sm:mb-6 border border-slate-100">
                            <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-slate-200" />
                        </div>
                        <h3 className="text-lg sm:text-xl text-slate-900 mb-2 sm:mb-3 tracking-tight">No Reports Yet</h3>
                        <p className="text-sm text-slate-500 max-w-sm mx-auto">Quality reports will appear here after you upload crops and run quality checks.</p>
                    </div>
                )}
            </div>

            {/* Report Details Modal */}
            {showDetails && selectedReport && (
                <div key={`modal-${selectedReport.id}`} className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl text-slate-900 font-semibold">{selectedReport.crop}</h3>
                                    <p className="text-sm text-slate-500 mt-1">Quality Report Details</p>
                                </div>
                                <button 
                                    onClick={closeModal}
                                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    <ChevronRight className="h-5 w-5 text-slate-400 rotate-180" />
                                </button>
                            </div>
                        </div>
                        
                        <div className="p-6 space-y-6">
                            {/* Grade Overview */}
                            <div className="flex items-center gap-6">
                                <div className="text-center">
                                    <p className={`text-4xl font-bold ${getGradeColor(selectedReport.score)}`}>
                                        {selectedReport.grade}
                                    </p>
                                    <p className="text-sm text-slate-500 mt-1">Grade</p>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-sm text-slate-600">Quality Score</span>
                                        <span className="text-lg font-semibold text-slate-900">{selectedReport.score}/100</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full ${getGradeColor(selectedReport.score).replace('text-', 'bg-')} transition-all`}
                                            style={{ width: `${selectedReport.score}%` }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Crop Information */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-50 rounded-lg p-4">
                                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Variety</p>
                                    <p className="text-sm font-medium text-slate-900">{selectedReport.variety}</p>
                                </div>
                                <div className="bg-slate-50 rounded-lg p-4">
                                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Analysis Type</p>
                                    <p className="text-sm font-medium text-slate-900">
                                        {selectedReport.type === 'ai_analysis' ? 'AI Analysis' : 'Manual Check'}
                                    </p>
                                </div>
                                <div className="bg-slate-50 rounded-lg p-4">
                                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Date</p>
                                    <p className="text-sm font-medium text-slate-900">{selectedReport.date}</p>
                                </div>
                                <div className="bg-slate-50 rounded-lg p-4">
                                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Report ID</p>
                                    <p className="text-sm font-medium text-slate-900">{selectedReport.id.substring(0, 8)}</p>
                                </div>
                            </div>

                            {/* Detailed Metrics */}
                            {selectedReport.details && typeof selectedReport.details === 'object' && (
                                <div>
                                    <h4 className="text-sm font-medium text-slate-900 mb-4">Quality Metrics</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        {Object.entries(selectedReport.details).map(([key, value]) => {
                                            // Skip complex objects and arrays
                                            if (key === 'recommendations' || key === 'marketValue' || key === 'shelfLife' || key === 'storageConditions') {
                                                return null;
                                            }
                                            // Skip if value is an object
                                            if (typeof value === 'object' && value !== null) {
                                                return null;
                                            }
                                            // Skip if value is undefined or null
                                            if (value === undefined || value === null) {
                                                return null;
                                            }
                                            return (
                                                <div key={key} className="flex justify-between items-center py-2 border-b border-slate-100">
                                                    <span className="text-sm text-slate-600 capitalize">
                                                        {key.replace(/([A-Z])/g, ' $1').trim()}
                                                    </span>
                                                    <span className="text-sm font-medium text-slate-900">
                                                        {typeof value === 'number' ? `${value}%` : String(value)}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Recommendations */}
                            {selectedReport.details?.recommendations && Array.isArray(selectedReport.details.recommendations) && (
                                <div>
                                    <h4 className="text-sm font-medium text-slate-900 mb-4">Recommendations</h4>
                                    <ul className="space-y-2">
                                        {selectedReport.details.recommendations.map((rec, index) => (
                                            <li key={index} className="flex items-start gap-2">
                                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 flex-shrink-0" />
                                                <span className="text-sm text-slate-600">{typeof rec === 'string' ? rec : String(rec)}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Market & Storage Info */}
                            {selectedReport.details && typeof selectedReport.details === 'object' && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
                                        <p className="text-xs text-emerald-600 uppercase tracking-wider mb-1">Market Value</p>
                                        <p className="text-sm font-medium text-emerald-900">
                                            {typeof selectedReport.details.marketValue === 'string' ? selectedReport.details.marketValue : 'N/A'}
                                        </p>
                                    </div>
                                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                                        <p className="text-xs text-blue-600 uppercase tracking-wider mb-1">Shelf Life</p>
                                        <p className="text-sm font-medium text-blue-900">
                                            {typeof selectedReport.details.shelfLife === 'string' ? selectedReport.details.shelfLife : 'N/A'}
                                        </p>
                                    </div>
                                    <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
                                        <p className="text-xs text-amber-600 uppercase tracking-wider mb-1">Storage</p>
                                        <p className="text-sm font-medium text-amber-900">
                                            {typeof selectedReport.details.storageConditions === 'string' ? selectedReport.details.storageConditions : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
