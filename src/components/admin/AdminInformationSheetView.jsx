// src/components/admin/AdminInformationSheetView.jsx
import React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  MapPin, 
  Phone, 
  Building2, 
  Mail, 
  Globe, 
  Users, 
  ShoppingCart, 
  Truck,
  Heart,
  FileUser
} from "lucide-react";

/**
 * Admin view for Information Sheet data
 * @param {Object} props
 * @param {Object} props.data - Information sheet object from user submission
 * @param {string} props.userName - Name of the user for context
 * @param {string} props.userEmail - Email of the user for context
 */
function AdminInformationSheetView({ data, userName, userEmail }) {
  if (!data || Object.keys(data).length === 0) {
    return (
      <Card className="border-amber-200 bg-amber-50 mb-4">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <FileUser className="w-5 h-5 text-amber-600" />
            <CardTitle className="text-amber-800">Information Sheet - Not Submitted</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-amber-700">This user has not yet submitted their Information Sheet.</p>
        </CardContent>
      </Card>
    );
  }

  // Helper to format missing/empty fields
  const display = (value) => (
    value !== undefined && value !== null && value !== "" ? 
    value : 
    <span className="text-gray-400 italic">Not provided</span>
  );

  // Calculate completion percentage
  const totalFields = Object.keys(data).length;
  const filledFields = Object.values(data).filter(val => val && val.toString().trim() !== "").length;
  const completionPercentage = totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0;

  return (
    <Card className="mb-6 border-slate-200 bg-white shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <FileUser className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">Information Sheet</CardTitle>
              <CardDescription>
                Personal and business information for {userName || userEmail}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge 
              variant={completionPercentage === 100 ? "default" : "secondary"}
              className={completionPercentage === 100 ? "bg-green-100 text-green-800" : ""}
            >
              {completionPercentage}% Complete
            </Badge>
            <Badge variant="outline" className="text-xs">
              {filledFields}/{totalFields} fields
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Personal Details Section */}
        <section>
          <div className="flex items-center space-x-2 mb-3">
            <User className="w-4 h-4 text-blue-600" />
            <h3 className="font-semibold text-slate-800">Personal Details</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-lg">
            <div>
              <label className="text-xs font-medium text-slate-600">Father's Name</label>
              <p className="text-sm">{display(data.fatherName)}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Mother's Name</label>
              <p className="text-sm">{display(data.motherName)}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Spouse's Name</label>
              <p className="text-sm">{display(data.spouseName)}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Education</label>
              <p className="text-sm">{display(data.education)}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Dependents</label>
              <p className="text-sm">{display(data.dependents)}</p>
            </div>
          </div>
        </section>

        {/* Address & Contact Section */}
        <section>
          <div className="flex items-center space-x-2 mb-3">
            <MapPin className="w-4 h-4 text-green-600" />
            <h3 className="font-semibold text-slate-800">Address & Contact Information</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg">
            <div>
              <label className="text-xs font-medium text-slate-600">Office Address</label>
              <p className="text-sm">{display(data.officeAddress)}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Residence Address</label>
              <p className="text-sm">{display(data.residenceAddress)}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Office Phone</label>
              <p className="text-sm flex items-center">
                <Phone className="w-3 h-3 mr-1" />
                {display(data.officePhone)}
              </p>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Residence Phone</label>
              <p className="text-sm flex items-center">
                <Phone className="w-3 h-3 mr-1" />
                {display(data.residencePhone)}
              </p>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Office Ownership</label>
              <p className="text-sm capitalize">{display(data.officeOwnership)}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Residence Ownership</label>
              <p className="text-sm capitalize">{display(data.residenceOwnership)}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Years at Current Residence</label>
              <p className="text-sm">{display(data.yearsAtCurrentResidence)} years</p>
            </div>
          </div>
        </section>

        {/* Business Information Section */}
        <section>
          <div className="flex items-center space-x-2 mb-3">
            <Building2 className="w-4 h-4 text-purple-600" />
            <h3 className="font-semibold text-slate-800">Business Information</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg">
            <div>
              <label className="text-xs font-medium text-slate-600">Business Nature</label>
              <p className="text-sm">{display(data.businessNature)}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Email</label>
              <p className="text-sm flex items-center">
                <Mail className="w-3 h-3 mr-1" />
                {data.email ? (
                  <a href={`mailto:${data.email}`} className="text-blue-600 hover:underline">
                    {data.email}
                  </a>
                ) : display(data.email)}
              </p>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-medium text-slate-600">Website</label>
              <p className="text-sm flex items-center">
                <Globe className="w-3 h-3 mr-1" />
                {data.website ? (
                  <a href={data.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {data.website}
                  </a>
                ) : display(data.website)}
              </p>
            </div>
          </div>
        </section>

        {/* Buyer Reference Section */}
        <section>
          <div className="flex items-center space-x-2 mb-3">
            <ShoppingCart className="w-4 h-4 text-indigo-600" />
            <h3 className="font-semibold text-slate-800">Buyer Reference</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg">
            <div>
              <label className="text-xs font-medium text-slate-600">Company Name</label>
              <p className="text-sm">{display(data.buyerCompanyName)}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Contact Name</label>
              <p className="text-sm">{display(data.buyerContactName)}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Contact Phone</label>
              <p className="text-sm flex items-center">
                <Phone className="w-3 h-3 mr-1" />
                {display(data.buyerContactPhone)}
              </p>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Address</label>
              <p className="text-sm">{display(data.buyerAddress)}</p>
            </div>
          </div>
        </section>

        {/* Supplier Reference Section */}
        <section>
          <div className="flex items-center space-x-2 mb-3">
            <Truck className="w-4 h-4 text-orange-600" />
            <h3 className="font-semibold text-slate-800">Supplier Reference</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg">
            <div>
              <label className="text-xs font-medium text-slate-600">Company Name</label>
              <p className="text-sm">{display(data.supplierCompanyName)}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Contact Name</label>
              <p className="text-sm">{display(data.supplierContactName)}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Contact Phone</label>
              <p className="text-sm flex items-center">
                <Phone className="w-3 h-3 mr-1" />
                {display(data.supplierContactPhone)}
              </p>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Address</label>
              <p className="text-sm">{display(data.supplierAddress)}</p>
            </div>
          </div>
        </section>

        {/* Personal References Section */}
        <section>
          <div className="flex items-center space-x-2 mb-3">
            <Users className="w-4 h-4 text-teal-600" />
            <h3 className="font-semibold text-slate-800">Personal References</h3>
          </div>
          <div className="space-y-4 bg-slate-50 p-4 rounded-lg">
            <div>
              <label className="text-xs font-medium text-slate-600">Friends & Relatives</label>
              <p className="text-sm">{display(data.friendsRelatives)}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Reference 1 */}
              <div className="bg-white p-3 rounded border">
                <h4 className="text-sm font-medium text-slate-700 mb-2 flex items-center">
                  <Heart className="w-3 h-3 mr-1" />
                  Reference 1
                </h4>
                <div className="space-y-2">
                  <div>
                    <label className="text-xs text-slate-500">Name</label>
                    <p className="text-sm">{display(data.ref1Name)}</p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">Phone</label>
                    <p className="text-sm flex items-center">
                      <Phone className="w-3 h-3 mr-1" />
                      {display(data.ref1Phone)}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">Address</label>
                    <p className="text-sm">{display(data.ref1Address)}</p>
                  </div>
                </div>
              </div>

              {/* Reference 2 */}
              <div className="bg-white p-3 rounded border">
                <h4 className="text-sm font-medium text-slate-700 mb-2 flex items-center">
                  <Heart className="w-3 h-3 mr-1" />
                  Reference 2
                </h4>
                <div className="space-y-2">
                  <div>
                    <label className="text-xs text-slate-500">Name</label>
                    <p className="text-sm">{display(data.ref2Name)}</p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">Phone</label>
                    <p className="text-sm flex items-center">
                      <Phone className="w-3 h-3 mr-1" />
                      {display(data.ref2Phone)}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">Address</label>
                    <p className="text-sm">{display(data.ref2Address)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </CardContent>
    </Card>
  );
}

export default AdminInformationSheetView;
