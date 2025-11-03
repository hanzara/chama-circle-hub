import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield, Eye, Lock, Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicyPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="text-center border-b">
            <CardTitle className="text-3xl font-bold text-primary">
              Privacy Policy
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              Last updated: {new Date().toLocaleDateString()}
            </p>
            <div className="flex justify-center gap-4 mt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4" />
                Your privacy is protected
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Lock className="h-4 w-4" />
                Data encrypted
              </div>
            </div>
          </CardHeader>

          <CardContent className="prose prose-slate max-w-none p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4">1. Introduction</h2>
              <p className="text-muted-foreground leading-relaxed">
                We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Chama management platform. Please read this privacy policy carefully.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4">2. Information We Collect</h2>
              
              <div className="space-y-6">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Database className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-medium">Personal Information</h3>
                  </div>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                    <li>Full name, email address, and phone number</li>
                    <li>Date of birth and national identification documents</li>
                    <li>Physical address and location data</li>
                    <li>Employment information and income details</li>
                    <li>Bank account and mobile money details</li>
                    <li>Profile photos and uploaded documents</li>
                  </ul>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Eye className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-medium">Financial Information</h3>
                  </div>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                    <li>Transaction history and payment details</li>
                    <li>Savings and investment account information</li>
                    <li>Credit history and loan applications</li>
                    <li>Chama membership and contribution records</li>
                    <li>Budget and spending patterns</li>
                    <li>Investment preferences and risk assessments</li>
                  </ul>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-medium">Technical Information</h3>
                  </div>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                    <li>Device information (IP address, browser type, operating system)</li>
                    <li>Usage patterns and app interactions</li>
                    <li>Log files and error reports</li>
                    <li>Location data (when location services are enabled)</li>
                    <li>Cookies and similar tracking technologies</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4">3. How We Use Your Information</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We use the information we collect for the following purposes:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h3 className="font-medium text-foreground">Service Provision</h3>
                  <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
                    <li>Account creation and management</li>
                    <li>Processing financial transactions</li>
                    <li>Facilitating Chama operations</li>
                    <li>Providing customer support</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h3 className="font-medium text-foreground">Compliance & Security</h3>
                  <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
                    <li>KYC and AML compliance</li>
                    <li>Fraud prevention and detection</li>
                    <li>Risk assessment and management</li>
                    <li>Regulatory reporting requirements</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h3 className="font-medium text-foreground">Service Improvement</h3>
                  <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
                    <li>Platform optimization and development</li>
                    <li>Personalized financial recommendations</li>
                    <li>Analytics and usage insights</li>
                    <li>New feature development</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h3 className="font-medium text-foreground">Communication</h3>
                  <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
                    <li>Transaction notifications</li>
                    <li>Account updates and alerts</li>
                    <li>Marketing communications (with consent)</li>
                    <li>Important service announcements</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4">4. Information Sharing and Disclosure</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">With Your Consent</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    We share your information with third parties only when you have given us explicit consent to do so.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">Service Providers</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    We work with trusted third-party service providers for payment processing, SMS services, cloud storage, and analytics. These providers are bound by strict confidentiality agreements.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">Legal Requirements</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    We may disclose your information when required by law, regulation, legal process, or government request, including compliance with KYC, AML, and tax reporting requirements.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">Within Chama Groups</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Basic information (name, contribution history) is shared with other members of your Chama groups as necessary for group operations. Financial details remain private unless specifically authorized.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4">5. Data Security</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-medium mb-2">Encryption</h3>
                  <p className="text-sm text-muted-foreground">
                    All sensitive data is encrypted in transit using TLS/SSL and at rest using AES-256 encryption.
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-medium mb-2">Access Controls</h3>
                  <p className="text-sm text-muted-foreground">
                    Strict access controls ensure only authorized personnel can access your data on a need-to-know basis.
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-medium mb-2">Monitoring</h3>
                  <p className="text-sm text-muted-foreground">
                    We continuously monitor our systems for security threats and unauthorized access attempts.
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-medium mb-2">Compliance</h3>
                  <p className="text-sm text-muted-foreground">
                    Our security practices comply with industry standards and regulatory requirements.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4">6. Your Privacy Rights</h2>
              <div className="space-y-4">
                <div className="p-4 bg-primary/5 rounded-lg">
                  <h3 className="font-medium mb-2">Access and Portability</h3>
                  <p className="text-sm text-muted-foreground">
                    You have the right to access your personal data and request a copy in a portable format.
                  </p>
                </div>
                <div className="p-4 bg-primary/5 rounded-lg">
                  <h3 className="font-medium mb-2">Correction and Updates</h3>
                  <p className="text-sm text-muted-foreground">
                    You can update your personal information at any time through your account settings.
                  </p>
                </div>
                <div className="p-4 bg-primary/5 rounded-lg">
                  <h3 className="font-medium mb-2">Deletion</h3>
                  <p className="text-sm text-muted-foreground">
                    You may request deletion of your account and personal data, subject to legal retention requirements.
                  </p>
                </div>
                <div className="p-4 bg-primary/5 rounded-lg">
                  <h3 className="font-medium mb-2">Marketing Opt-out</h3>
                  <p className="text-sm text-muted-foreground">
                    You can unsubscribe from marketing communications at any time using the unsubscribe link or contacting us.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4">7. Data Retention</h2>
              <p className="text-muted-foreground leading-relaxed">
                We retain your personal information for as long as necessary to provide our services and comply with legal obligations. Financial transaction data may be retained for up to 7 years as required by law. After this period, data is securely deleted or anonymized.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4">8. Cookies and Tracking</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We use cookies and similar technologies to enhance your experience:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong>Essential Cookies:</strong> Required for basic site functionality</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how you use our platform</li>
                <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                <li><strong>Security Cookies:</strong> Protect against fraud and enhance security</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                You can control cookies through your browser settings, though disabling essential cookies may affect platform functionality.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4">9. International Data Transfers</h2>
              <p className="text-muted-foreground leading-relaxed">
                Your data is primarily stored and processed in Kenya. When we transfer data internationally, we ensure appropriate safeguards are in place, including standard contractual clauses and adequacy decisions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4">10. Children's Privacy</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our services are not intended for individuals under 18 years of age. We do not knowingly collect personal information from children. If we become aware that we have collected personal information from a child, we will delete such information promptly.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4">11. Changes to This Privacy Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last updated" date. We encourage you to review this Privacy Policy periodically.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4">12. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                If you have any questions about this Privacy Policy or our privacy practices, please contact us:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-medium mb-2">General Inquiries</h3>
                  <p className="text-sm text-muted-foreground">
                    Email: privacy@chamaapp.com<br />
                    Phone: +254 XXX XXX XXX
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-medium mb-2">Data Protection Officer</h3>
                  <p className="text-sm text-muted-foreground">
                    Email: dpo@chamaapp.com<br />
                    Address: Nairobi, Kenya
                  </p>
                </div>
              </div>
            </section>

            <section className="border-t pt-6">
              <div className="bg-primary/5 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground italic">
                  By using our Service, you acknowledge that you have read and understood this Privacy Policy and agree to the collection, use, and disclosure of your information as described herein.
                </p>
              </div>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;