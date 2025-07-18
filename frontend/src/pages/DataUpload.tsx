import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Alert,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  CloudUpload,
  CheckCircle,
  Error,
  Warning,
  InsertDriveFile,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';

const DataUpload: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [validationResults, setValidationResults] = useState<any>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setUploading(true);
    setUploadProgress(0);
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          processFiles(acceptedFiles);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  }, []);

  const processFiles = (files: File[]) => {
    const processedFiles = files.map((file) => ({
      name: file.name,
      size: file.size,
      uploadTime: new Date().toLocaleString(),
      status: 'processed',
      records: Math.floor(Math.random() * 1000) + 100,
      validRecords: Math.floor(Math.random() * 900) + 50,
      errors: Math.floor(Math.random() * 50),
    }));

    setUploadedFiles((prev) => [...prev, ...processedFiles]);
    
    // Simulate validation results
    setValidationResults({
      totalRecords: processedFiles.reduce((sum, file) => sum + file.records, 0),
      validRecords: processedFiles.reduce((sum, file) => sum + file.validRecords, 0),
      errorRecords: processedFiles.reduce((sum, file) => sum + file.errors, 0),
      duplicates: Math.floor(Math.random() * 20),
      warnings: Math.floor(Math.random() * 30),
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv'],
    },
    multiple: true,
  });

  const handlePreview = (file: any) => {
    // Simulate preview data
    const mockData = [
      { 
        resident_id: '600999', 
        resident_name: 'John Doe', 
        balance: '$150.00', 
        due_date: '2024-05-31',
        facility: 'Highland Manor',
        contact_name: 'Jane Doe',
        contact_number: '+1234567890'
      },
      { 
        resident_id: '601000', 
        resident_name: 'Mary Smith', 
        balance: '$250.75', 
        due_date: '2024-06-15',
        facility: 'Highland Manor',
        contact_name: 'John Smith',
        contact_number: '+1234567891'
      },
    ];
    setPreviewData(mockData);
    setPreviewOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processed':
        return 'success';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#333' }}>
        Data Upload & Management
      </Typography>
      
      <Grid container spacing={3}>
        {/* Upload Section */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Upload Patient Data
              </Typography>
              
              <Box
                {...getRootProps()}
                sx={{
                  border: '2px dashed #ccc',
                  borderRadius: 2,
                  p: 4,
                  textAlign: 'center',
                  cursor: 'pointer',
                  backgroundColor: isDragActive ? '#f0f8ff' : '#fafafa',
                  transition: 'background-color 0.2s',
                  '&:hover': {
                    backgroundColor: '#f0f8ff',
                  },
                }}
              >
                <input {...getInputProps()} />
                <CloudUpload sx={{ fontSize: 48, color: '#666', mb: 2 }} />
                <Typography variant="body1" sx={{ mb: 1 }}>
                  {isDragActive
                    ? 'Drop the files here...'
                    : 'Drag & drop Excel files here, or click to select'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Supported formats: .xlsx, .xls, .csv
                </Typography>
              </Box>

              {uploading && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Uploading and processing files...
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={uploadProgress} 
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
              )}

              {validationResults && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    <strong>Upload Summary:</strong> {validationResults.totalRecords} total records, {' '}
                    {validationResults.validRecords} valid, {validationResults.errorRecords} errors, {' '}
                    {validationResults.duplicates} duplicates
                  </Typography>
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Upload Status */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Upload History
              </Typography>
              
              {uploadedFiles.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No files uploaded yet
                </Typography>
              ) : (
                <List>
                  {uploadedFiles.map((file, index) => (
                    <ListItem
                      key={index}
                      sx={{
                        border: '1px solid #eee',
                        borderRadius: 1,
                        mb: 1,
                        backgroundColor: '#fafafa',
                      }}
                    >
                      <ListItemIcon>
                        <InsertDriveFile color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={file.name}
                        secondary={`${file.records} records • ${file.uploadTime}`}
                      />
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Chip
                          label={file.status}
                          size="small"
                          color={getStatusColor(file.status)}
                        />
                        <Button
                          size="small"
                          onClick={() => handlePreview(file)}
                        >
                          Preview
                        </Button>
                      </Box>
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Data Validation Results */}
        {validationResults && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Data Validation Results
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={3}>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                      <CheckCircle sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                      <Typography variant="h6">{validationResults.validRecords}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Valid Records
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                      <Error sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
                      <Typography variant="h6">{validationResults.errorRecords}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Errors
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                      <Warning sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                      <Typography variant="h6">{validationResults.warnings}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Warnings
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                      <Typography variant="h6" sx={{ color: 'info.main' }}>
                        {validationResults.duplicates}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Duplicates
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Preview Dialog */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Data Preview</DialogTitle>
        <DialogContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Resident ID</TableCell>
                  <TableCell>Resident Name</TableCell>
                  <TableCell>Balance</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell>Facility</TableCell>
                  <TableCell>Contact Name</TableCell>
                  <TableCell>Contact Number</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {previewData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.resident_id}</TableCell>
                    <TableCell>{row.resident_name}</TableCell>
                    <TableCell>{row.balance}</TableCell>
                    <TableCell>{row.due_date}</TableCell>
                    <TableCell>{row.facility}</TableCell>
                    <TableCell>{row.contact_name}</TableCell>
                    <TableCell>{row.contact_number}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DataUpload;
