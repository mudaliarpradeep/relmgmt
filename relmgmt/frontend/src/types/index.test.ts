import { getStatusEnumName, getSkillFunctionEnumName, Status, SkillFunction } from './index';

describe('Utility Functions', () => {
  describe('getStatusEnumName', () => {
    it('should convert Active to ACTIVE', () => {
      expect(getStatusEnumName(Status.ACTIVE)).toBe('ACTIVE');
    });

    it('should convert Inactive to INACTIVE', () => {
      expect(getStatusEnumName(Status.INACTIVE)).toBe('INACTIVE');
    });

    it('should return the same value for unknown status', () => {
      expect(getStatusEnumName('Unknown' as any)).toBe('Unknown');
    });
  });

  describe('getSkillFunctionEnumName', () => {
    it('should convert Functional Design to FUNCTIONAL_DESIGN', () => {
      expect(getSkillFunctionEnumName(SkillFunction.FUNCTIONAL_DESIGN)).toBe('FUNCTIONAL_DESIGN');
    });

    it('should convert Technical Design to TECHNICAL_DESIGN', () => {
      expect(getSkillFunctionEnumName(SkillFunction.TECHNICAL_DESIGN)).toBe('TECHNICAL_DESIGN');
    });

    it('should convert Build to BUILD', () => {
      expect(getSkillFunctionEnumName(SkillFunction.BUILD)).toBe('BUILD');
    });

    it('should convert Test to TEST', () => {
      expect(getSkillFunctionEnumName(SkillFunction.TEST)).toBe('TEST');
    });

    it('should convert Platform to PLATFORM', () => {
      expect(getSkillFunctionEnumName(SkillFunction.PLATFORM)).toBe('PLATFORM');
    });

    it('should convert Governance to GOVERNANCE', () => {
      expect(getSkillFunctionEnumName(SkillFunction.GOVERNANCE)).toBe('GOVERNANCE');
    });

    it('should return the same value for unknown skill function', () => {
      expect(getSkillFunctionEnumName('Unknown' as any)).toBe('Unknown');
    });
  });
}); 