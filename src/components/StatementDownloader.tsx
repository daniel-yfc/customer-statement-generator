import React, { useMemo } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { Download, Loader2 } from 'lucide-react';
import StatementPDF from './StatementPDF';
import { StatementState } from '../state/statementReducer';

// 擴展 Props 以接收完整的 state 和計算後的 totals
interface Props extends StatementState {
    mileslinesTotal: number;
    mileslinesSubtotal: number;
    tax: number;
    toshinTotalTWD: number;
    grandTotal: number;
    billingPeriodText: string;
}

const StatementDownloader: React.FC<Props> = (props) => {
    const fileName = useMemo(() => {
        const customerName = props.customerData.name.replace(/股份有限公司|有限公司/g, '');
        return `${customerName}-${props.billingPeriodText.replace(/ /g, '')}-對帳單.pdf`;
    }, [props.customerData.name, props.billingPeriodText]);
    
    // 將所有需要的 props 傳遞給 PDF 文件
    const document = <StatementPDF {...props} />;
    const isDisabled = props.grandTotal === 0;

    return (
        <PDFDownloadLink document={document} fileName={fileName}>
            {/* 修正：移除參數的顯式類型 BlobProviderParams，讓 TypeScript 自動推斷 */}
            {({ loading }) => (
                <button
                    className="no-print bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading || isDisabled}
                >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                    {loading ? 'PDF 正在生成...' : '下載 PDF'}
                </button>
            )}
        </PDFDownloadLink>
    );
};

export default StatementDownloader;

