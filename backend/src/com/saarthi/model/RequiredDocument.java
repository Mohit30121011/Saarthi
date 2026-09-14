package com.saarthi.model;

public class RequiredDocument {
    private int docId;
    private int schemeId;
    private String documentName;
    private String documentCategory; // ID Proof | Income Proof | Address Proof | Educational Certificate | Bank Details | Photograph | Other
    private boolean mandatory;

    public int getDocId() { return docId; }
    public void setDocId(int docId) { this.docId = docId; }

    public int getSchemeId() { return schemeId; }
    public void setSchemeId(int schemeId) { this.schemeId = schemeId; }

    public String getDocumentName() { return documentName; }
    public void setDocumentName(String documentName) { this.documentName = documentName; }

    public String getDocumentCategory() { return documentCategory; }
    public void setDocumentCategory(String documentCategory) { this.documentCategory = documentCategory; }

    public boolean isMandatory() { return mandatory; }
    public void setMandatory(boolean mandatory) { this.mandatory = mandatory; }
}
