package com.saarthi.model;

public class EligibilityRule {
    private int ruleId;
    private int schemeId;
    private String attributeName; // age | annual_income | gender | category | state | occupation | education_level | disability_status | is_bpl | is_minority
    private String operator;      // =, !=, >=, <=, >, <, IN
    private String value;         // comma-separated for IN
    private String ruleDescription;
    private String sourceTextSnippet;

    public int getRuleId() { return ruleId; }
    public void setRuleId(int ruleId) { this.ruleId = ruleId; }

    public int getSchemeId() { return schemeId; }
    public void setSchemeId(int schemeId) { this.schemeId = schemeId; }

    public String getAttributeName() { return attributeName; }
    public void setAttributeName(String attributeName) { this.attributeName = attributeName; }

    public String getOperator() { return operator; }
    public void setOperator(String operator) { this.operator = operator; }

    public String getValue() { return value; }
    public void setValue(String value) { this.value = value; }

    public String getRuleDescription() { return ruleDescription; }
    public void setRuleDescription(String ruleDescription) { this.ruleDescription = ruleDescription; }

    public String getSourceTextSnippet() { return sourceTextSnippet; }
    public void setSourceTextSnippet(String sourceTextSnippet) { this.sourceTextSnippet = sourceTextSnippet; }
}
