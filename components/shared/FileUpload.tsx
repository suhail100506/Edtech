"use client";

import React, { useState, useRef } from "react";
import { useDataset } from "@/lib/context/DatasetContext";
import { UploadResult, Learner } from "@/lib/types";
import { APP_CONFIG, REQUIRED_CSV_COLUMNS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  UploadCloud,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  X,
  FileText,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBadge } from "./StatusBadge";
import { RiskBadge } from "./RiskBadge";

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FileUploadModal({ isOpen, onClose }: FileUploadModalProps) {
  const { processCsvFile, applyParsedDataset, resetToDefaults } = useDataset();
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<UploadResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateAndProcessFile = async (file: File) => {
    setErrorMsg(null);
    setValidationResult(null);

    // Validate extension
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setErrorMsg("Invalid file format. Please upload a comma-separated values (.csv) file.");
      return;
    }

    // Validate size (20MB)
    if (file.size > APP_CONFIG.maxUploadSizeBytes) {
      setErrorMsg("File exceeds the 20 MB size limit. Please upload a smaller file.");
      return;
    }

    if (file.size === 0) {
      setErrorMsg("The selected file is empty (0 bytes). Please upload a valid CSV.");
      return;
    }

    setSelectedFile(file);
    setIsProcessing(true);

    try {
      const res = await processCsvFile(file);
      if (!res.success) {
        setErrorMsg(res.message || "Failed to validate dataset.");
      } else {
        setValidationResult(res);
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Error parsing CSV file");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  const handleConfirmAnalysis = () => {
    if (validationResult && validationResult.previewRows.length > 0) {
      // Apply parsed dataset
      applyParsedDataset(validationResult.previewRows as Learner[]);
      onClose();
    }
  };

  const handleResetModal = () => {
    setSelectedFile(null);
    setValidationResult(null);
    setErrorMsg(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-surface p-6 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text">Upload Learner Activity CSV</h2>
              <p className="text-xs text-text-muted">
                Analyze student completion and dropout risk using custom activity data
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-text-muted hover:bg-surface-muted hover:text-text transition-colors"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="py-5 space-y-5">
          {!selectedFile ? (
            <div>
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all",
                  dragActive
                    ? "border-primary bg-primary-soft/30 scale-[0.99]"
                    : "border-border bg-surface-muted/30 hover:bg-surface-muted/60 hover:border-slate-300"
                )}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft text-primary mb-3">
                  <UploadCloud className="h-7 w-7" />
                </div>
                <h3 className="text-sm font-semibold text-text">
                  Click to browse or drag and drop your CSV
                </h3>
                <p className="text-xs text-text-muted mt-1">
                  Accepts standard UTF-8 .csv files up to 20 MB
                </p>
              </div>

              {/* Required Columns Reference */}
              <div className="mt-4 rounded-xl border border-border bg-slate-50/70 p-4">
                <p className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-primary" />
                  Required CSV Schema Columns:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {REQUIRED_CSV_COLUMNS.map((col) => (
                    <span
                      key={col}
                      className="inline-block rounded-md bg-white border border-slate-200 px-2 py-0.5 text-[11px] font-mono font-medium text-slate-700"
                    >
                      {col}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Selected file banner */}
              <div className="flex items-center justify-between rounded-xl border border-border bg-surface-muted/50 p-3">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="h-6 w-6 text-primary shrink-0" />
                  <div className="truncate">
                    <p className="text-sm font-medium text-text truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-text-muted">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetModal}
                  className="text-xs text-text-muted hover:text-danger"
                >
                  Change file
                </Button>
              </div>

              {isProcessing && (
                <div className="flex items-center justify-center p-8 space-x-3 text-text-muted">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  <span className="text-sm font-medium">Validating schema and parsing rows...</span>
                </div>
              )}

              {/* Validation Feedback & Preview */}
              {validationResult && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  {/* Summary Metric Chips */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="rounded-xl border border-border bg-white p-3 text-center">
                      <span className="text-xs text-text-muted">Total Rows</span>
                      <p className="text-lg font-bold text-text">
                        {validationResult.rowCount.toLocaleString()}
                      </p>
                    </div>
                    <div className="rounded-xl border border-border bg-white p-3 text-center">
                      <span className="text-xs text-text-muted">Completion Rate</span>
                      <p className="text-lg font-bold text-emerald-600">
                        {validationResult.completionStats.rate}%
                      </p>
                    </div>
                    <div className="rounded-xl border border-border bg-white p-3 text-center">
                      <span className="text-xs text-text-muted">Missing Values</span>
                      <p
                        className={cn(
                          "text-lg font-bold",
                          validationResult.missingValues.total > 0
                            ? "text-amber-600"
                            : "text-emerald-600"
                        )}
                      >
                        {validationResult.missingValues.total}
                      </p>
                    </div>
                    <div className="rounded-xl border border-border bg-white p-3 text-center">
                      <span className="text-xs text-text-muted">Duplicates</span>
                      <p
                        className={cn(
                          "text-lg font-bold",
                          validationResult.duplicateLearners > 0
                            ? "text-amber-600"
                            : "text-emerald-600"
                        )}
                      >
                        {validationResult.duplicateLearners}
                      </p>
                    </div>
                  </div>

                  {/* Schema Validation Status */}
                  <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>All 8 required schema columns verified successfully.</span>
                  </div>

                  {/* 5-Row Data Preview */}
                  <div>
                    <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                      First 5 Records Preview:
                    </h4>
                    <div className="overflow-x-auto rounded-xl border border-border">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-surface-muted border-b border-border text-text-muted">
                          <tr>
                            <th className="p-2 font-medium">ID</th>
                            <th className="p-2 font-medium">Course</th>
                            <th className="p-2 font-medium">Login</th>
                            <th className="p-2 font-medium">Video</th>
                            <th className="p-2 font-medium">Quiz</th>
                            <th className="p-2 font-medium">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border bg-white">
                          {validationResult.previewRows.map((row, i) => (
                            <tr key={i}>
                              <td className="p-2 font-mono font-medium">{row.Learner_ID}</td>
                              <td className="p-2">{row.Course_ID}</td>
                              <td className="p-2">{row.Login_Frequency}</td>
                              <td className="p-2">{row.Video_Completion}%</td>
                              <td className="p-2">{row.Quiz_Attempts}</td>
                              <td className="p-2">
                                <StatusBadge
                                  status={row.Completion_Status || "Not Completed"}
                                  showIcon={false}
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error Alert */}
          {errorMsg && (
            <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800">
              <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-rose-900">Upload Validation Error</p>
                <p className="mt-0.5 leading-relaxed">{errorMsg}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-4 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={resetToDefaults}
            className="text-xs text-text-muted hover:text-text w-full sm:w-auto"
          >
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
            Reset to Baseline Data (500 learners)
          </Button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={!validationResult || !validationResult.success}
              onClick={handleConfirmAnalysis}
              className="bg-primary hover:bg-primary-hover text-white font-medium"
            >
              Analyze Dataset
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
