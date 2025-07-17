
import React, { useRef } from 'react';
import { PDFDownloadLink, Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontSize: 12
  },
  section: {
    margin: 10,
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#000'
  },
  label: {
    marginBottom: 5,
    fontSize: 10,
    fontWeight: 'bold'
  },
  input: {
    marginBottom: 10,
    padding: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#000'
  }
});

const MyDocument = ({ data }) => (
  <Document>
    {data.map((pageContent, index) => (
      <Page key={index} style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.label}>Name:</Text>
          <Text style={styles.input}>{pageContent.name}</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.input}>{pageContent.email}</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.label}>Message:</Text>
          <Text style={styles.input}>{pageContent.message}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Message:</Text>
          <Text style={styles.input}>{pageContent.message}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Message:</Text>
          <Text style={styles.input}>{pageContent.message}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Message:</Text>
          <Text style={styles.input}>{pageContent.message}</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.label}>Message:</Text>
          <Text style={styles.input}>{pageContent.message}</Text>
        </View> <View style={styles.section}>
          <Text style={styles.label}>Message:</Text>
          <Text style={styles.input}>{pageContent.message}</Text>
        </View>
        {/* Add more fields as needed */}
      </Page>
    ))}
  </Document>
);

const Riskprofile = () => {
  const data = [
    { name: 'John Doe', email: 'john@example.com', message: 'Hello' },
    // { name: 'Jane Smith', email: 'jane@example.com', message: 'Hi' },
    // { name: 'Tom Brown', email: 'tom@example.com', message: 'Hey' },
    // { name: 'Lucy Green', email: 'lucy@example.com', message: 'Good day' }
    // Add as many pages as needed
  ];

  return (
    <div>
      <h1>PDF Generator Example</h1>
      <PDFDownloadLink document={<MyDocument data={data} />} fileName="form.pdf">
        {({ loading }) => (loading ? 'Generating PDF...' : 'Download PDF')}
      </PDFDownloadLink>
    </div>
  );
};

export default Riskprofile;
