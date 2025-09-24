import { getOptions, spacer } from '@/utility/logicFunctions';
import { Document, Page, Text, View, StyleSheet, pdf, Image } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import * as React from 'react';

// Types for survey response data
interface SurveyResponse {
  id: string;
  user: {
    name: string;
    email: string;
    roles?: Array<{ id: string; name: string }>;
  };
  answers: Array<{
    questionId: string;
    answerText?: string;
    answerOptions?: string[];
  }>;
  createdAt: string;
}

interface SurveyQuestion {
  id: string;
  title: string;
  type: string;
  description?: string;
  required?: boolean;
  options?: string;
  ratingLabel?: string;
  minValue?: number;
  maxValue?: number;
  minLabel?: string;
  maxLabel?: string;
}

interface Survey {
  id: string;
  title: string;
  description?: string;
  organization?: {
    name: string;
  };
  questionItems: SurveyQuestion[];
}

interface ExportOptions {
  survey: Survey;
  responses: SurveyResponse[];
  fileName: string;
  dateRange?: {
    start: Date | null;
    end: Date | null;
  };
}

// PDF Styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 20,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottom: '2 solid #E5E7EB',
    paddingBottom: 15,
  },
  companyInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  logo: {
    width: 50,
    height: 50,
  },
  companyDetails: {
    flex: 1,
    marginLeft: 15,
  },
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 3,
  },
  companyText: {
    fontSize: 8,
    color: '#6B7280',
    marginBottom: 1,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 5,
    color: '#1F2937',
  },
  surveyTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
    color: '#374151',
  },
  reportDate: {
    fontSize: 9,
    textAlign: 'center',
    color: '#6B7280',
    marginBottom: 10,
  },
  summaryInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#F9FAFB',
    padding: 10,
    marginBottom: 20,
    borderRadius: 5,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 8,
    color: '#6B7280',
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  responseContainer: {
    marginBottom: 25,
    borderRadius: 5,
    border: '1 solid #E5E7EB',
    backgroundColor: '#FEFEFE',
  },
  responseHeader: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderBottom: '1 solid #E5E7EB',
  },
  responseTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  responseMetadata: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 1,
  },
  userEmail: {
    fontSize: 8,
    color: '#6B7280',
    marginBottom: 2,
  },
  userRoles: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 3,
  },
  roleTag: {
    backgroundColor: '#DBEAFE',
    color: '#1E40AF',
    fontSize: 7,
    padding: '2 6',
    borderRadius: 3,
  },
  submissionDate: {
    fontSize: 8,
    color: '#6B7280',
    textAlign: 'right',
  },
  answersContainer: {
    padding: 12,
  },
  questionBlock: {
    marginBottom: 15,
  },
  questionText: {
    fontSize: 10,
    fontWeight: 500,
    color: '#1F2937',
    marginBottom: 6,
    lineHeight: 1.4,
  },
  answerText: {
    fontSize: 9,
    color: '#374151',
    lineHeight: 1.3,
    paddingLeft: 10,
    borderLeft: '2 solid #E5E7EB',
    paddingTop: 3,
    paddingBottom: 3,
  },
  noAnswer: {
    fontSize: 9,
    color: '#9CA3AF',
    fontStyle: 'italic',
    paddingLeft: 10,
  },
  multipleChoice: {
    paddingLeft: 10,
  },
  choiceItem: {
    fontSize: 9,
    color: '#374151',
    marginBottom: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  bullet: {
    width: 4,
    height: 4,
    backgroundColor: '#6B7280',
    borderRadius: 2,
    marginRight: 6,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 7,
    borderTop: '1 solid #E5E7EB',
    paddingTop: 8,
  },
  pageBreak: {
    marginTop: 20,
  },
});

// Helper function to format date
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Helper function to get answer for a question
const getAnswerForQuestion = (questionId: string, answers: SurveyResponse['answers']) => {
  return answers.find(answer => answer.questionId === questionId);
};

// Main PDF generation function
export const generateSurveyResponsesPDF = async (options: ExportOptions): Promise<void> => {
  const { survey, responses, fileName, dateRange } = options;

  if (!responses || responses.length === 0) {
    throw new Error('No responses available to export');
  }

  try {
    // Filter responses by date range if provided
    const filteredResponses = dateRange?.start || dateRange?.end
      ? responses.filter(response => {
          const responseDate = new Date(response.createdAt);
          const startDate = dateRange.start;
          const endDate = dateRange.end;
          
          if (startDate && responseDate < startDate) return false;
          if (endDate && responseDate > endDate) return false;
          return true;
        })
      : responses;

    // Calculate responses per page (adjust based on content)
    const responsesPerPage = 2; // Show 2 responses per page for better readability
    const totalPages = Math.ceil(filteredResponses.length / responsesPerPage);

    // PDF Document Component
    const PDFDocument: React.FC = () => (
      <Document>
        {Array.from({ length: totalPages }, (_, pageIndex) => {
          const startIndex = pageIndex * responsesPerPage;
          const endIndex = Math.min(startIndex + responsesPerPage, filteredResponses.length);
          const pageResponses = filteredResponses.slice(startIndex, endIndex);

          return (
            <Page key={`page-${pageIndex}`} size="A4" style={styles.page}>
              {/* Header - only on first page */}
              {pageIndex === 0 && (
                <View style={styles.header}>
                  <View style={styles.companyInfo}>
                    <Image style={styles.logo} src="/logo.png" />
                    <View style={styles.companyDetails}>
                      <Text style={styles.companyName}>RICH CLS</Text>
                      <Text style={styles.companyText}>Address: 332M+24C, KN 14 Ave, Kigali</Text>
                      <Text style={styles.companyText}>Phone: 0784 390 384</Text>
                      <Text style={styles.companyText}>Email: richrwanda@gmail.com</Text>
                    </View>
                  </View>
                  <Text style={styles.reportTitle}>Survey Responses Report</Text>
                  <Text style={styles.surveyTitle}>{survey.title}</Text>
                  <Text style={styles.reportDate}>
                    Generated on {new Date().toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                  
                  {/* Summary Information */}
                  <View style={styles.summaryInfo}>
                    <View style={styles.summaryItem}>
                      <Text style={styles.summaryLabel}>Total Responses</Text>
                      <Text style={styles.summaryValue}>{filteredResponses.length}</Text>
                    </View>
                    <View style={styles.summaryItem}>
                      <Text style={styles.summaryLabel}>Questions</Text>
                      <Text style={styles.summaryValue}>{survey.questionItems.length}</Text>
                    </View>
                    {survey.organization && (
                      <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>Organization</Text>
                        <Text style={styles.summaryValue}>{survey.organization.name}</Text>
                      </View>
                    )}
                  </View>
                </View>
              )}

              {/* Response Content */}
              {pageResponses.map((response, responseIndex) => (
                <View key={response.id} style={[
                  styles.responseContainer,
                  responseIndex > 0 ? styles.pageBreak : {}
                ]}>
                  {/* Response Header */}
                  <View style={styles.responseHeader}>
                    <Text style={styles.responseTitle}>
                      Response #{startIndex + responseIndex + 1}
                    </Text>
                    <View style={styles.responseMetadata}>
                      <View style={styles.userInfo}>
                        <Text style={styles.userName}>{response.user.name}</Text>
                        <Text style={styles.userEmail}>{response.user.email}</Text>
                        {response.user.roles && response.user.roles.length > 0 && (
                          <View style={styles.userRoles}>
                            {response.user.roles.map((role) => (
                              <Text key={role.id} style={styles.roleTag}>
                                {spacer(role.name)}
                              </Text>
                            ))}
                          </View>
                        )}
                      </View>
                      <Text style={styles.submissionDate}>
                        {formatDate(response.createdAt)}
                      </Text>
                    </View>
                  </View>

                  {/* Answers */}
                  <View style={styles.answersContainer}>
                    {survey.questionItems.map((question, qIndex) => {
                      const answer = getAnswerForQuestion(question.id, response.answers);
                      
                      return (
                        <View key={question.id} style={styles.questionBlock}>
                          <Text style={styles.questionText}>
                            {qIndex + 1}. {question.title}
                            {question.required && ' *'}
                            ({spacer(question.type)})
                          </Text>
                          {question.description && (
                            <Text style={styles.answerText}>
                              {question.description}
                            </Text>
                          )}
                          
                          {answer ? (
                            <>
                              {answer.answerText && (
                                <Text style={styles.answerText}>
                                  {answer.answerText}
                                </Text>
                              )}
                              {getOptions(answer.answerOptions)?.length > 0 && (
                                <View style={styles.multipleChoice}>
                                  {getOptions(answer.answerOptions)?.map((option, optIndex) => (
                                    <View key={optIndex} style={styles.choiceItem}>
                                      <View style={styles.bullet} />
                                      <Text>{option}</Text>
                                    </View>
                                  ))}
                                </View>
                              )}
                            </>
                          ) : (
                            <Text style={styles.noAnswer}>No answer provided</Text>
                          )}
                        </View>
                      );
                    })}
                  </View>
                </View>
              ))}

              {/* Footer */}
              <Text style={styles.footer}>
                © {new Date().getFullYear()} RICH CLS. All rights reserved. | Page {pageIndex + 1} of {totalPages}
              </Text>
            </Page>
          );
        })}
      </Document>
    );

    // Generate and download PDF
    const blob = await pdf(<PDFDocument />).toBlob();
    saveAs(blob, `${fileName}_responses.pdf`);
  } catch (err) {
    console.error('Failed to export survey responses PDF:', err);
    throw new Error('Failed to export PDF. Please try again.');
  }
};
