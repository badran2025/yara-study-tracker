import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an unhandled error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    try {
      localStorage.removeItem('study_tracker_subjects');
      localStorage.removeItem('study_tracker_data_version');
      sessionStorage.clear();
    } catch (e) {
      console.error(e);
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans" dir="rtl">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full text-center space-y-5 border border-slate-200 shadow-xl">
            <div className="w-16 h-16 rounded-3xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-sm">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                عذراً، حدث خطأ غير متوقع أثناء العرض
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                تم حفظ بياناتك بأمان. يمكنك إعادة تحميل الصفحة لتحديث المنصة وتجاوز المشكلة فوراً.
              </p>
            </div>

            <button
              onClick={this.handleReload}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>إعادة تحميل المنصة وتحديث البيانات 🔄</span>
            </button>

            {this.state.error && (
              <details className="text-right text-xs bg-slate-100 p-3 rounded-xl text-slate-700 font-mono overflow-auto max-h-40">
                <summary className="font-bold cursor-pointer text-slate-500">تفاصيل الخطأ الفنية</summary>
                <p className="mt-2 text-rose-600 whitespace-pre-wrap">{this.state.error.toString()}</p>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
