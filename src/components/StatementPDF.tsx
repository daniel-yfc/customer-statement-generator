// src/components/StatementPDF.tsx
import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import { Customer, MileslinesItem, ToshinItem } from '../types';
import '../fonts'; 

// Props for the PDF document
interface StatementPDFProps {
    customerData: Customer;
    mileslinesItems: MileslinesItem[];
    toshinItems: ToshinItem[];
    exchangeRate: number;
    mileslinesTotal: number;
    mileslinesSubtotal: number;
    tax: number;
    toshinTotalTWD: number;
    grandTotal: number;
    billingPeriodText: string;
    statementDate: string;
    remarks: string[];
}

const styles = StyleSheet.create({
    document: { fontFamily: 'Noto Sans TC' },
    page: { padding: "50px 50px 100px 50px", fontFamily: 'Noto Sans TC', fontSize: 10, color: '#333' },
    // ... 其他樣式 ...
    // 優化：將樣式集中管理，增加可讀性
    header: { flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#ccc', marginBottom: 20 },
    companyName: { fontSize: 16, fontWeight: 700 },
    companyDetail: { fontSize: 9, color: '#666' },
    statementTitle: { fontSize: 18, fontWeight: 'bold' },
    customerSection: { marginBottom: 20, border: 1, borderColor: '#eee', padding: 10, borderRadius: 3 },
    table: { display: "flex", flexDirection: "column", width: 'auto', borderStyle: "solid", borderWidth: 1, borderColor: '#bfbfbf' },
    tableRow: { flexDirection: "row", borderStyle: "solid", borderBottomWidth: 1, borderColor: '#bfbfbf' },
    tableColHeader: { width: "15%", backgroundColor: '#f2f2f2', padding: 5, fontWeight: 'bold' },
    tableCol: { width: "15%", padding: 5 },
    footer: { position: 'absolute', bottom: 50, left: 50, right: 50, flexDirection: 'row', justifyContent: 'space-around', borderTopWidth: 1, paddingTop: 8 },
});

// PDF Component
const StatementPDF: React.FC<StatementPDFProps> = ({ customerData, mileslinesItems, toshinItems, mileslinesTotal, toshinTotalTWD, ...props }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            {/* ... Header and Customer Info ... */}
            
            {/* 優化：符合規格 2.7.2，當總金額為零時，不顯示該區塊 */}
            {mileslinesTotal > 0 && (
                <View style={{marginBottom: 20}}>
                    <Text style={{fontSize: 14, fontWeight: 'bold', marginBottom: 5}}>紡織助劑</Text>
                    {/* ... Mileslines Table ... */}
                </View>
            )}

            {toshinTotalTWD > 0 && (
                <View style={{marginBottom: 20}}>
                    <Text style={{fontSize: 14, fontWeight: 'bold', marginBottom: 5}}>設備零組件</Text>
                    {/* ... Toshin Table ... */}
                </View>
            )}

            {/* ... Totals Section ... */}

            <View fixed style={styles.footer}>
                <Text>製表 Prepared by</Text>
                <Text>確認 Confirmed by</Text>
                <Text>核准 Approved by</Text>
            </View>
        </Page>
    </Document>
);

export default StatementPDF;