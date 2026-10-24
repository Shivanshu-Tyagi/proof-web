import { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Calendar, 
  Edit, 
  Save, 
  X,
  Camera,
  Settings,
  Heart,
  Target,
  Activity,
  Award
} from 'lucide-react';
import { toast } from 'react-toastify';
import useAuthStore from '../store/authStore';

const Profile = ({ embedded = false }) => {
  const { user, updateProfile, isLoading } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    dateOfBirth: '',
    preferences: {
      theme: 'system',
      notifications: {
        email: true,
        push: true,
        milestones: true,
        activities: true
      }
    }
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        bio: user.bio || '',
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
        preferences: {
          theme: user.preferences?.theme || 'system',
          notifications: {
            email: user.preferences?.notifications?.email ?? true,
            push: user.preferences?.notifications?.push ?? true,
            milestones: user.preferences?.notifications?.milestones ?? true,
            activities: user.preferences?.notifications?.activities ?? true
          }
        },
        historyPrivacy: user.historyPrivacy || 'private'
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      if (parent === 'notifications') {
        setFormData(prev => ({
          ...prev,
          preferences: {
            ...prev.preferences,
            notifications: {
              ...prev.preferences.notifications,
              [child]: type === 'checkbox' ? checked : value
            }
          }
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          preferences: {
            ...prev.preferences,
            [child]: value
          }
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const result = await updateProfile(formData);
    
    if (result.success) {
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } else {
      const errorMessage = result.error?.message || 'Failed to update profile';
      const validationErrors = result.error?.errors;

      if (validationErrors && validationErrors.length > 0) {
        validationErrors.forEach(err => toast.error(err.msg));
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const handleCancel = () => {
    // Reset form data to original user data
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        bio: user.bio || '',
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
        preferences: {
          theme: user.preferences?.theme || 'system',
          notifications: {
            email: user.preferences?.notifications?.email ?? true,
            push: user.preferences?.notifications?.push ?? true,
            milestones: user.preferences?.notifications?.milestones ?? true,
            activities: user.preferences?.notifications?.activities ?? true
          }
        },
        historyPrivacy: user.historyPrivacy || 'private'
      });
    }
    setIsEditing(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateAge = (dateString) => {
    if (!dateString) return null;
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary-500"></div>
      </div>
    );
  }

  return (
    <div className={embedded ? 'animate-fade-in' : 'min-h-screen bg-gray-100 dark:bg-gray-900 animate-fade-in'}>
      <div className={embedded ? '' : 'max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8'}>
        {!embedded && (
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400 text-base">Manage your personal information and preferences</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
{/*            
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-custom-light dark:shadow-custom-dark border border-gray-200 dark:border-gray-700 p-6">
           
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.fullName}
                      className="w-28 h-28 rounded-full mx-auto object-cover"
                    />
                  ) : (
                    <div className="w-28 h-28 rounded-full bg-secondary-500 flex items-center justify-center mx-auto">
                      <span className="text-white text-3xl font-medium">
                        {user.firstName?.[0]}{user.lastName?.[0]}
                      </span>
                    </div>
                  )}
                  <button className="absolute bottom-0 right-0 p-2 bg-white dark:bg-gray-700 rounded-full shadow-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500 transition-colors duration-200">
                    <Camera className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-4">
                  {user.fullName}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-base">@{user.username}</p>
              </div>

            
              <div className="space-y-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Heart className="h-5 w-5 text-red-500" />
                    <span className="text-base text-gray-600 dark:text-gray-400">Relationships</span>
                  </div>
                  <span className="text-base font-medium text-gray-900 dark:text-white">5</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-blue-500" />
                    <span className="text-base text-gray-600 dark:text-gray-400">Milestones</span>
                  </div>
                  <span className="text-base font-medium text-gray-900 dark:text-white">12</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-5 w-5 text-green-500" />
                    <span className="text-base text-gray-600 dark:text-gray-400">Activities</span>
                  </div>
                  <span className="text-base font-medium text-gray-900 dark:text-white">28</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Award className="h-5 w-5 text-yellow-500" />
                    <span className="text-base text-gray-600 dark:text-gray-400">Certificates</span>
                  </div>
                  <span className="text-base font-medium text-gray-900 dark:text-white">3</span>
                </div>
              </div>

             
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2 text-base text-gray-600 dark:text-gray-400">
                  <Calendar className="h-5 w-5" />
                  <span>Member since {formatDate(user.createdAt)}</span>
                </div>
              </div>
            </div>
          </div> */}

          {/* Profile Details */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-custom-light dark:shadow-custom-dark border border-gray-200 dark:border-gray-700">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Personal Information
                  </h3>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </button>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        onClick={handleCancel}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-secondary-700 dark:text-secondary-300 bg-secondary-100 dark:bg-secondary-800 hover:bg-secondary-200 dark:hover:bg-secondary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </button>
                      <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {isLoading ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      First Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="block w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-secondary-500 focus:border-secondary-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
                      />
                    ) : (
                      <p className="text-base text-gray-900 dark:text-white">{user.firstName}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Last Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="block w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-secondary-500 focus:border-secondary-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
                      />
                    ) : (
                      <p className="text-base text-gray-900 dark:text-white">{user.lastName}</p>
                    )}
                  </div>
                </div>

                {/* Email (read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <p className="text-base text-gray-900 dark:text-white">{user.email}</p>
                  </div>
                </div>

                {/* Username (read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Username
                  </label>
                  <div className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-gray-400" />
                    <p className="text-base text-gray-900 dark:text-white">@{user.username}</p>
                  </div>
                </div>

                {/* Registration ID (read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Registration ID
                  </label>
                  <div className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-gray-400" />
                    <p className="font-mono text-base text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-md">
                      {user.registrationId || 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Date of Birth */}
                <div>
                  <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date of Birth
                  </label>
                  {isEditing ? (
                    <input
                      type="date"
                      id="dateOfBirth"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      className="block w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-secondary-500 focus:border-secondary-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
                    />
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <p className="text-base text-gray-900 dark:text-white">
                        {formatDate(user.dateOfBirth)}
                        {user.dateOfBirth && (
                          <span className="text-gray-500 dark:text-gray-400 ml-2">
                            (Age {calculateAge(user.dateOfBirth)})
                          </span>
                        )}
                      </p>
                    </div>
                  )}
                </div>

                {/* Bio */}
                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bio
                  </label>
                  {isEditing ? (
                    <textarea
                      id="bio"
                      name="bio"
                      rows={4}
                      value={formData.bio}
                      onChange={handleChange}
                      placeholder="Tell us about yourself..."
                      className="block w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-secondary-500 focus:border-secondary-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
                    />
                  ) : (
                    <p className="text-base text-gray-900 dark:text-white">
                      {user.bio || 'No bio added yet.'}
                    </p>
                  )}
                </div>

              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;