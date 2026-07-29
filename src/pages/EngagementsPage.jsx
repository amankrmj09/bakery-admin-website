import React, { useEffect, useState, useRef } from 'react';
import { engagementsApi } from '../api/engagementsApi';
import { toast } from 'sonner';
import { MessageSquare, Star, Search, CheckCircle2, ShieldAlert, Users, Mail, MessageCircle, Loader2, MapPin, Save, Trash2 } from 'lucide-react';
import SleekSearchDropdown from '../components/ui/SleekSearchDropdown';
import Pagination from '../components/shared/Pagination';
import { useScrollTop } from '../hooks/useScrollTop';
import { cn } from '../lib/utils';
import ActionButton from '../components/ui/ActionButton';
import ActionIconButton from '../components/ui/ActionIconButton';
import { FaInstagram, FaFacebook, FaGlobe } from 'react-icons/fa';
import { FaXTwitter, FaThreads } from 'react-icons/fa6';


export default function EngagementsPage() {
  const isScrolled = useScrollTop();
  const [activeTab, setActiveTab] = useState('testimonials');
  const [testimonials, setTestimonials] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchOptions, setSearchOptions] = useState([]);
  const [searchDropdownLoading, setSearchDropdownLoading] = useState(false);
  const searchTimeoutRef = useRef(null);

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);

  const [contactInfo, setContactInfo] = useState({ 
    address: '', 
    phoneNumbers: ['', ''], 
    emails: ['', ''],
    socialLinks: { instagram: '', facebook: '', twitter: '', threads: '', website: '' }
  });
  const [contactInfoSaving, setContactInfoSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'testimonials') {
        const res = await engagementsApi.getTestimonials(page, pageSize);
        setTestimonials(res.data?.content || res.data || []);
        setTotalElements(res.data?.page?.totalElements || res.data?.totalElements || res.data?.length || 0);
      } else if (activeTab === 'contact-info') {
        const res = await engagementsApi.getContactDetails();
        setContactInfo({
          address: res.data.address || '',
          phoneNumbers: [res.data.phoneNumbers?.[0] || '', res.data.phoneNumbers?.[1] || ''],
          emails: [res.data.emails?.[0] || '', res.data.emails?.[1] || ''],
          socialLinks: {
            instagram: res.data.socialLinks?.instagram || '',
            facebook:  res.data.socialLinks?.facebook  || '',
            twitter:   res.data.socialLinks?.twitter   || '',
            threads:   res.data.socialLinks?.threads   || '',
            website:   res.data.socialLinks?.website   || ''
          }
        });
      } else {
        const res = await engagementsApi.getFeedbacks(page, pageSize);
        setFeedbacks(res.data?.content || res.data || []);
        setTotalElements(res.data?.page?.totalElements || res.data?.totalElements || res.data?.length || 0);
      }
    } catch (error) {
      toast.error('Failed to load engagement data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab, page, pageSize]);

  useEffect(() => {
    setPage(0);
  }, [activeTab]);

  const totalPages = Math.ceil(totalElements / pageSize) || 1;

  const handleDropdownSearch = (query) => {
    if (!query) {
      setSearchOptions([]);
      return;
    }
    
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    
    searchTimeoutRef.current = setTimeout(async () => {
      setSearchDropdownLoading(true);
      try {
        if (activeTab === 'testimonials') {
          const res = await engagementsApi.searchTestimonials(query);
          const data = res.data?.content || res.data || [];
          const opts = data.map(item => ({ value: item.id, label: item.name || 'Anonymous User' }));
          setSearchOptions(opts);
        } else {
          const res = await engagementsApi.searchFeedbacks(query);
          const data = res.data?.content || res.data || [];
          const opts = data.map(item => ({ value: item.id, label: item.name || 'Anonymous' }));
          setSearchOptions(opts);
        }
      } catch (error) {
        console.error('Dropdown search failed:', error);
      } finally {
        setSearchDropdownLoading(false);
      }
    }, 300);
  };

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!searchQuery) {
      fetchData();
      return;
    }
    setSearching(true);
    try {
      if (activeTab === 'testimonials') {
        const res = await engagementsApi.searchTestimonials(searchQuery);
        setTestimonials(res.data?.content || res.data || []);
        setTotalElements(res.data?.page?.totalElements || res.data?.totalElements || res.data?.content?.length || 0);
      } else {
        const res = await engagementsApi.searchFeedbacks(searchQuery);
        setFeedbacks(res.data?.content || res.data || []);
        setTotalElements(res.data?.page?.totalElements || res.data?.totalElements || res.data?.content?.length || 0);
      }
      setPage(0);
    } catch (error) {
      toast.error('Search failed');
    } finally {
      setSearching(false);
    }
  };

  const handleToggleFeature = async (id, currentFeatured) => {
    const newFeatured = !currentFeatured;
    try {
      await engagementsApi.toggleFeatured(id, newFeatured);
      toast.success(newFeatured ? 'Testimonial featured!' : 'Testimonial unfeatured');
      setTestimonials(testimonials.map(t => t.id === id ? { ...t, isFeatured: newFeatured } : t));
    } catch (error) {
      const msg = error.response?.data?.error || 'Failed to update featured status';
      toast.error(msg);
    }
  };

  const handleDeleteTestimonial = async (id) => {
    if (!window.confirm("Are you sure you want to delete this testimonial?")) return;
    try {
      await engagementsApi.deleteTestimonial(id);
      toast.success("Testimonial deleted");
      setTestimonials(testimonials.filter(t => t.id !== id));
      setTotalElements(prev => prev - 1);
    } catch (error) {
      toast.error("Failed to delete testimonial");
    }
  };

  const handleSaveContactInfo = async (e) => {
    e.preventDefault();
    setContactInfoSaving(true);
    try {
      const payload = {
        address: contactInfo.address,
        phoneNumbers: contactInfo.phoneNumbers.filter(p => p.trim() !== ''),
        emails: contactInfo.emails.filter(em => em.trim() !== ''),
        socialLinks: contactInfo.socialLinks
      };
      await engagementsApi.updateContactDetails(payload);
      toast.success('Contact info updated successfully');
    } catch (error) {
      toast.error('Failed to update contact info');
    } finally {
      setContactInfoSaving(false);
    }
  };

  const featuredCount = testimonials.filter(t => t.isFeatured).length;

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const filteredFeedbacks = activeTab === 'feedbacks' 
    ? feedbacks.filter(f => f.type !== 'CONTACT_US') 
    : feedbacks.filter(f => f.type === 'CONTACT_US');

  return (
    <div className="flex flex-col min-h-full gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full pb-8">
      {/* Header */}
      <div className={cn(
        "sticky top-0 z-40 flex justify-between items-center flex-wrap gap-4 transition-all duration-300",
        isScrolled 
          ? "bg-[var(--bg-panel)]/80 backdrop-blur-xl border border-[var(--border-color)] shadow-md rounded-2xl px-6 py-4 mt-2" 
          : "bg-transparent border-transparent py-2"
      )}>
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-main)] mb-1 flex items-center gap-2">
            <Users className="text-[var(--color-primary)] h-6 w-6" />
            Customer Engagements
          </h1>
          <p className="text-[var(--text-muted)] text-sm">Manage testimonials, community feedback, and contact inquiries</p>
        </div>

        {activeTab === 'testimonials' && (
          <div className="flex items-center gap-2 bg-[var(--bg-panel)] px-4 py-2 rounded-xl border border-[var(--border-color)] shadow-sm">
            <span className="text-sm font-semibold text-[var(--text-main)]">Featured on Storefront:</span>
            <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${featuredCount >= 5 ? 'bg-amber-500/20 text-amber-500' : 'bg-[var(--color-primary)]/20 text-[var(--color-primary)]'}`}>
              {featuredCount} / 5
            </span>
          </div>
        )}
      </div>

      {/* Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => { setActiveTab('testimonials'); setSearchQuery(''); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'testimonials' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
          >
            <Star className="w-4 h-4 text-amber-500" /> Testimonials
          </button>
          <button
            onClick={() => { setActiveTab('feedbacks'); setSearchQuery(''); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'feedbacks' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
          >
            <MessageCircle className="w-4 h-4 text-blue-500" /> Feedback
          </button>
          <button
            onClick={() => { setActiveTab('contact'); setSearchQuery(''); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'contact' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
          >
            <Mail className="w-4 h-4 text-emerald-500" /> Contact Us
          </button>
          <button
            onClick={() => { setActiveTab('contact-info'); setSearchQuery(''); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'contact-info' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
          >
            <MapPin className="w-4 h-4 text-purple-500" /> Contact Info
          </button>
        </div>

        {activeTab !== 'contact-info' && (
          <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <SleekSearchDropdown
                value={searchQuery}
                onChange={(opt) => {
                  setSearchQuery(opt.label);
                }}
                onSearch={(val) => {
                  setSearchQuery(val);
                  handleDropdownSearch(val);
                }}
                onEnter={(val) => {
                  setSearchQuery(val);
                }}
                options={searchOptions}
                isLoading={searchDropdownLoading}
                placeholder="Search User"
                headerTitle="SEARCH USERS"
              />
            </div>
            <button
              type="submit"
              disabled={searching}
              className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-2"
            >
              {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
            </button>
            {searchQuery && (
              <button
                type="button"
                onClick={() => { setSearchQuery(''); fetchData(); setSearchOptions([]); }}
                className="text-xs text-gray-500 hover:text-gray-700 underline"
              >
                Clear
              </button>
            )}
          </form>
        )}
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin mb-3" />
          <p className="text-gray-500 text-sm font-medium">Loading engagement records...</p>
        </div>
      ) : activeTab === 'testimonials' ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
          {testimonials.length === 0 ? (
            <div className="text-center py-16">
              <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900">No testimonials found</h3>
              <p className="text-gray-500 text-sm mt-1">When users submit testimonials, they will appear here for curation.</p>
            </div>
          ) : (
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {testimonials.map((item) => (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl border p-5 shadow-sm transition-all flex flex-col justify-between gap-4 ${item.isFeatured ? 'border-amber-400 ring-2 ring-amber-400/20 bg-amber-50/20' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        {item.profileImageUrl ? (
                          <img src={item.profileImageUrl} alt={item.name} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                            {getInitials(item.name)}
                          </div>
                        )}
                        <div>
                          <h4 className="font-bold text-gray-900 text-sm">{item.name || 'Anonymous User'}</h4>
                          <span className="text-xs text-gray-400">ID: {item.uid || item.id}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-lg text-xs font-bold border border-amber-200/60">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        {item.rating || 5} / 5
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm italic line-clamp-3">"{item.message}"</p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-400 font-medium">
                      Status: <span className="text-emerald-600 font-semibold">{item.status || 'APPROVED'}</span>
                    </span>

                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={!!item.isFeatured}
                          onChange={() => handleToggleFeature(item.id, item.isFeatured)}
                          className="w-4 h-4 text-amber-500 rounded border-gray-300 focus:ring-amber-500 cursor-pointer"
                        />
                        <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">
                          Feature
                        </span>
                      </label>
                      <ActionIconButton
                        icon={Trash2}
                        title="Delete Testimonial"
                        onClick={() => handleDeleteTestimonial(item.id)}
                        colorClass="text-gray-400 hover:text-red-500 hover:bg-red-50"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {/* Pagination Controls */}
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalElements={totalElements}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(newSize) => { setPageSize(newSize); setPage(0); }}
            loading={loading}
          />
        </div>
      ) : activeTab === 'feedbacks' || activeTab === 'contact' ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
          {filteredFeedbacks.length === 0 ? (
            <div className="text-center py-16">
              <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900">No messages found</h3>
              <p className="text-gray-500 text-sm mt-1">Customer inquiries and feedback will appear here.</p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {filteredFeedbacks.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm flex flex-col sm:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-bold text-gray-900 text-sm">{item.name || 'Anonymous'}</span>
                      {item.email && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-mono">{item.email}</span>}
                      <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-semibold uppercase">{item.type || 'GENERAL'}</span>
                    </div>
                    <p className="text-gray-700 text-sm">{item.message}</p>
                  </div>
                  <div className="flex sm:flex-col justify-between sm:items-end text-xs text-gray-400 font-medium">
                    <span>Status: <strong className="text-gray-700">{item.status || 'NEW'}</strong></span>
                    <span>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recent'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          {/* Pagination Controls */}
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalElements={totalElements}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(newSize) => { setPageSize(newSize); setPage(0); }}
            loading={loading}
          />
        </div>
      ) : activeTab === 'contact-info' ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 max-w-3xl">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Storefront Contact Information</h2>
          <form onSubmit={handleSaveContactInfo} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Location Address</label>
              <textarea
                rows="3"
                value={contactInfo.address}
                onChange={e => setContactInfo({ ...contactInfo, address: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all resize-none"
                placeholder="123 Bakery Street..."
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Primary Phone</label>
                <input
                  type="text"
                  value={contactInfo.phoneNumbers[0]}
                  onChange={e => setContactInfo({ ...contactInfo, phoneNumbers: [e.target.value, contactInfo.phoneNumbers[1]] })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                  placeholder="+1 (555) 123-4567"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Secondary Phone</label>
                <input
                  type="text"
                  value={contactInfo.phoneNumbers[1]}
                  onChange={e => setContactInfo({ ...contactInfo, phoneNumbers: [contactInfo.phoneNumbers[0], e.target.value] })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                  placeholder="+1 (555) 987-6543 (Optional)"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Primary Email</label>
                <input
                  type="email"
                  value={contactInfo.emails[0]}
                  onChange={e => setContactInfo({ ...contactInfo, emails: [e.target.value, contactInfo.emails[1]] })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                  placeholder="hello@blubugbakery.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Secondary Email</label>
                <input
                  type="email"
                  value={contactInfo.emails[1]}
                  onChange={e => setContactInfo({ ...contactInfo, emails: [contactInfo.emails[0], e.target.value] })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                  placeholder="support@blubugbakery.com (Optional)"
                />
              </div>
            </div>

             {/* Social Media Links */}
            <div className="pt-4 border-t border-gray-100">
              <h3 className="text-base font-bold text-gray-900 mb-1">Social Media Links</h3>
              <p className="text-xs text-gray-500 mb-4">These links will appear in the user site footer. Leave blank to hide.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Instagram */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
                    <FaInstagram className="w-4 h-4 text-pink-500" />
                    Instagram
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-400">
                      <FaInstagram className="w-4 h-4" />
                    </span>
                    <input
                      type="url"
                      value={contactInfo.socialLinks.instagram}
                      onChange={e => setContactInfo({ ...contactInfo, socialLinks: { ...contactInfo.socialLinks, instagram: e.target.value } })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all"
                      placeholder="https://instagram.com/..."
                    />
                  </div>
                </div>

                {/* Facebook */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
                    <FaFacebook className="w-4 h-4 text-blue-600" />
                    Facebook
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500">
                      <FaFacebook className="w-4 h-4" />
                    </span>
                    <input
                      type="url"
                      value={contactInfo.socialLinks.facebook}
                      onChange={e => setContactInfo({ ...contactInfo, socialLinks: { ...contactInfo.socialLinks, facebook: e.target.value } })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                      placeholder="https://facebook.com/..."
                    />
                  </div>
                </div>

                {/* Twitter / X */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
                    <FaXTwitter className="w-4 h-4 text-gray-900" />
                    Twitter / X
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-700">
                      <FaXTwitter className="w-4 h-4" />
                    </span>
                    <input
                      type="url"
                      value={contactInfo.socialLinks.twitter}
                      onChange={e => setContactInfo({ ...contactInfo, socialLinks: { ...contactInfo.socialLinks, twitter: e.target.value } })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all"
                      placeholder="https://x.com/..."
                    />
                  </div>
                </div>

                {/* Threads */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
                    <FaThreads className="w-4 h-4 text-gray-800" />
                    Threads
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600">
                      <FaThreads className="w-4 h-4" />
                    </span>
                    <input
                      type="url"
                      value={contactInfo.socialLinks.threads}
                      onChange={e => setContactInfo({ ...contactInfo, socialLinks: { ...contactInfo.socialLinks, threads: e.target.value } })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all"
                      placeholder="https://threads.net/@..."
                    />
                  </div>
                </div>

                {/* Website */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
                    <FaGlobe className="w-4 h-4 text-primary" />
                    Website / URL
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/70">
                      <FaGlobe className="w-4 h-4" />
                    </span>
                    <input
                      type="url"
                      value={contactInfo.socialLinks.website || ''}
                      onChange={e => setContactInfo({ ...contactInfo, socialLinks: { ...contactInfo.socialLinks, website: e.target.value } })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                      placeholder="https://..."
                    />
                  </div>
                </div>


              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <ActionButton
                type="submit"
                disabled={contactInfoSaving}
                text={contactInfoSaving ? "Saving..." : "Save Changes"}
                icon={Save}
                showArrow={true}
              />
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}

