
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Users, Mail, Copy, Check, Phone, Link as LinkIcon, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useInvitations, type Invitation } from '@/hooks/useInvitations';
import Navigation from '@/components/Navigation';
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const InviteMembersPage = () => {
  const navigate = useNavigate();
  const { id: chamaId } = useParams();
  const { toast } = useToast();
  const { invitations, createInvitation, isCreating, revokeInvitation, approveRequest, rejectRequest } = useInvitations(chamaId || '');
  
  const [email, setEmail] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [role, setRole] = useState<string>('member');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const handleCreateInvite = (e: React.FormEvent) => {
    e.preventDefault();
    createInvitation({ 
      email: email || undefined, 
      phoneNumber: phoneNumber || undefined, 
      role 
    });
    // Clear form
    setEmail('');
    setPhoneNumber('');
  };

  const handleApprove = (invitationId: string) => {
    if (confirm('Approve this join request?')) {
      approveRequest(invitationId);
    }
  };

  const handleReject = (invitationId: string) => {
    if (confirm('Reject this join request?')) {
      rejectRequest(invitationId);
    }
  };

  const copyInviteLink = (invitationId: string, token: string | null | undefined) => {
    if (!token) {
      toast({
        title: 'Error',
        description: 'Invitation token not available',
        variant: 'destructive',
      });
      return;
    }
    
    const inviteUrl = `${window.location.origin}/join-chama?token=${token}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedToken(invitationId);
    toast({
      title: 'Link copied',
      description: 'Invitation link copied to clipboard',
    });
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const handleRevoke = (invitationId: string) => {
    if (confirm('Are you sure you want to revoke this invitation?')) {
      revokeInvitation(invitationId);
    }
  };

  const getStatusBadge = (status: Invitation['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'pending_approval':
        return <Badge className="bg-amber-500">Awaiting Approval</Badge>;
      case 'accepted':
        return <Badge variant="default">Accepted</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'expired':
        return <Badge variant="outline">Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Invite Members</h1>
              <p className="text-muted-foreground">Grow your Chama community</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Generate Invitation Link */}
            <Card>
              <CardHeader>
                <CardTitle>Generate Invitation Link</CardTitle>
                <CardDescription>
                  Create a shareable link for new members to request to join
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateInvite} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email (Optional)</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="member@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number (Optional)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+254712345678"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Default Role</Label>
                    <Select value={role} onValueChange={setRole}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="treasurer">Treasurer</SelectItem>
                        <SelectItem value="secretary">Secretary</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" disabled={isCreating} className="w-full">
                    {isCreating ? 'Generating Link...' : 'Generate Invitation Link'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Pending Approval Requests */}
            {invitations.some((inv: Invitation) => inv.status === 'pending_approval') && (
              <Card>
                <CardHeader>
                  <CardTitle>Pending Approval Requests</CardTitle>
                  <CardDescription>
                    Members waiting for your approval
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {invitations
                      .filter((inv: Invitation) => inv.status === 'pending_approval')
                      .map((invitation: any) => (
                        <div key={invitation.id} className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-semibold text-lg">{invitation.full_name}</p>
                              <div className="text-sm text-muted-foreground space-y-1 mt-1">
                                <p>📧 {invitation.email}</p>
                                <p>📱 {invitation.phone_number}</p>
                                <p className="text-xs mt-2">Requested {formatDate(invitation.created_at)}</p>
                              </div>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <Button
                                size="sm"
                                onClick={() => handleApprove(invitation.id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <Check className="h-3 w-3 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleReject(invitation.id)}
                              >
                                <X className="h-3 w-3 mr-1" />
                                Reject
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Invitations */}
            <Card>
              <CardHeader>
                <CardTitle>Invitation Links</CardTitle>
                <CardDescription>
                  Share these links with potential members
                </CardDescription>
              </CardHeader>
              <CardContent>
                {invitations.filter(inv => inv.status === 'pending' || inv.status === 'accepted').length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    No invitations yet
                  </p>
                ) : (
                  <div className="space-y-3">
                    {invitations
                      .filter(inv => inv.status === 'pending' || inv.status === 'accepted')
                      .map((invitation) => (
                        <div key={invitation.id} className="flex justify-between items-start p-4 bg-muted/50 rounded-lg border">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {invitation.role && invitation.role !== 'member' && (
                                <Badge variant="outline" className="text-xs">
                                  {invitation.role} role
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              Created {formatDate(invitation.created_at)}
                              {invitation.expires_at && (
                                <span> • Expires {formatDate(invitation.expires_at)}</span>
                              )}
                            </p>
                            {invitation.status === 'pending' && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => copyInviteLink(invitation.id, invitation.invitation_token)}
                                >
                                  {copiedToken === invitation.id ? (
                                    <>
                                      <Check className="h-3 w-3 mr-1" />
                                      Copied
                                    </>
                                  ) : (
                                    <>
                                      <LinkIcon className="h-3 w-3 mr-1" />
                                      Copy Link
                                    </>
                                  )}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleRevoke(invitation.id)}
                                >
                                  <X className="h-3 w-3 mr-1" />
                                  Revoke
                                </Button>
                              </div>
                            )}
                          </div>
                          <div>
                            {getStatusBadge(invitation.status)}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default InviteMembersPage;
